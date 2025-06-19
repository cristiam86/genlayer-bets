# { "Depends": "py-genlayer:test" }

import json
from dataclasses import dataclass
from genlayer import *
from datetime import datetime, timezone


@allow_storage
@dataclass
class Bet:
    id: str
    resolution_date: str
    has_resolved: bool
    resolution_url: str
    title: str
    description: str
    category: str
    outcome: u256
    reason: str
    possible_outcomes: DynArray[str]


class GenLayerBets(gl.Contract):
    bets: DynArray[Bet]
    x_handlers: TreeMap[Address, str]
    discord_handlers: TreeMap[Address, str]
    user_bets: TreeMap[Address, DynArray[u256]]
    overall_points: TreeMap[Address, u256]
    owner: Address

    def __init__(self):
        self.owner = gl.message.sender_address

    def _require_owner(self):
        if gl.message.sender_address != self.owner:
            raise Exception("Only the contract owner can call this method")

    @gl.public.write
    def create_bet(
        self,
        bet_id: str,
        resolution_date: str,
        resolution_url: str,
        title: str,
        description: str,
        category: str,
        possible_outcomes: DynArray[str],
    ) -> None:
        """
        Creates a new betting event. Only the contract owner can call this method.

        Args:
            bet_id: Unique identifier for the bet
            date: Date when the bet can be resolved (YYYY-MM-DD format)
            resolution_url: URL to check for bet resolution
            title: Title of the betting event
            description: Description of what is being bet on
            possible_outcomes: List of possible outcomes for the bet
        """
        self._require_owner()

        # Check if bet ID already exists
        existing_bet = next((bet for bet in self.bets if bet.id == bet_id), None)
        if existing_bet is not None:
            raise Exception(f"Bet with id {bet_id} already exists")

        # Validate that there are at least 2 possible outcomes
        if len(possible_outcomes) < 2:
            raise Exception("Bet must have at least 2 possible outcomes")

        # Create the new bet
        new_bet = Bet(
            id=bet_id,
            resolution_date=resolution_date,
            has_resolved=False,
            resolution_url=resolution_url,
            title=title,
            description=description,
            category=category,
            outcome=0,  # Default value, will be set when resolved
            reason="",  # Default value, will be set when resolved
            possible_outcomes=possible_outcomes,
        )

        # Add the bet to the contract
        self.bets.append(new_bet)

    def _check_bet(self, bet: Bet) -> str:
        bet_resolution_url = bet.resolution_url
        bet_title = bet.title
        bet_description = bet.description
        bet_possible_outcomes = bet.possible_outcomes

        def get_bet_result() -> str:
            web_data = gl.get_webpage(bet_resolution_url, mode="text")

            task = f"""
In the following web content, you need to resolve a bet about {bet_title}: {bet_description}

The possible outcomes are: {bet_possible_outcomes}

Web content:
{web_data}

Respond in JSON:
{{
    "outcome": str, // This should be one of the possible outcomes. e.g., "Yes" or "No" 
    "reason": str, // This should be a short explanation of why you chose the outcome. e.g., "The new AI model is expected to be released by June 20"
}}
It is mandatory that you respond only using the JSON format above,
nothing else. Don't include any other words or characters,
your output must be only JSON without any formatting prefix or suffix.
This result should be perfectly parsable by a JSON parser without errors.
        """
            result = gl.exec_prompt(task).replace("```json", "").replace("```", "")
            print("result", result)
            return json.dumps(json.loads(result), sort_keys=True)

        result_json = json.loads(
            gl.eq_principle.prompt_comparative(
                get_bet_result, "the outcome should be the same"
            )
        )
        print("result_json", result_json)
        return result_json

    @gl.public.write
    def resolve_bet(self, bet_id: str) -> None:
        self._require_owner()

        bet = next((bet for bet in self.bets if bet.id == bet_id), None)

        if bet is None:
            raise Exception(f"Bet with id {bet_id} not found")

        if bet.has_resolved:
            raise Exception("Bet already resolved")

        if datetime.now(timezone.utc) < datetime.strptime(
            bet.resolution_date, "%Y-%m-%d"
        ).replace(tzinfo=timezone.utc):
            raise Exception("It is too soon to resolve this bet")

        bet_status = self._check_bet(bet)

        bet.has_resolved = True
        bet.outcome = bet.possible_outcomes.index(bet_status["outcome"])
        bet.reason = bet_status["reason"]

        # Find the bet index in the bets array
        bet_index = next((i for i, b in enumerate(self.bets) if b.id == bet_id), None)
        if bet_index is None:
            raise Exception(f"Bet with id {bet_id} not found in bets array")

        # Evaluate all user bets and award points
        for user_address, user_bets_array in self.user_bets.items():
            # Check if user has placed a bet on this specific bet
            if (
                bet_index < len(user_bets_array)
                and user_bets_array[bet_index] is not None
            ):
                user_bet_outcome = user_bets_array[bet_index]

                # Check if the user's prediction matches the actual outcome
                if user_bet_outcome == bet.outcome:
                    # Increment overall points for this user
                    if user_address not in self.overall_points:
                        self.overall_points[user_address] = 0
                    self.overall_points[user_address] += 1

    @gl.public.view
    def get_bets(self) -> dict:
        serialized_bets = []
        for bet_index, bet in enumerate(self.bets):
            # Collect user bets for this specific bet
            users_bets_for_this_bet = {}
            users_points_for_this_bet = {}

            for user_address, user_bets_array in self.user_bets.items():
                if (
                    bet_index < len(user_bets_array)
                    and user_bets_array[bet_index] is not None
                ):
                    users_bets_for_this_bet[user_address.as_hex] = user_bets_array[
                        bet_index
                    ]

                    # Calculate points for this user on this bet
                    if bet.has_resolved and user_bets_array[bet_index] == bet.outcome:
                        users_points_for_this_bet[user_address.as_hex] = 1
                    else:
                        users_points_for_this_bet[user_address.as_hex] = 0

            serialized_bet = {
                "id": bet.id,
                "resolution_date": bet.resolution_date,
                "has_resolved": bet.has_resolved,
                "resolution_url": bet.resolution_url,
                "title": bet.title,
                "description": bet.description,
                "category": bet.category,
                "outcome": bet.outcome,
                "reason": bet.reason,
                "possible_outcomes": bet.possible_outcomes,
                "users_bets": users_bets_for_this_bet,
                "users_points": users_points_for_this_bet,
            }
            serialized_bets.append(serialized_bet)
        return serialized_bets

    @gl.public.view
    def get_points(self) -> dict:
        return {k.as_hex: v for k, v in self.overall_points.items()}

    @gl.public.view
    def get_player_points(self, player_address: str) -> int:
        return self.overall_points.get(Address(player_address), 0)

    # @gl.public.view
    # def get_user_bets(self, user_address: str) -> dict:
    #     """
    #     Returns all bets for a specific user.

    #     Args:
    #         user_address: The address of the user

    #     Returns:
    #         Dictionary containing user's bets and their details
    #     """
    #     address = Address(user_address)
    #     if address not in self.user_bets:
    #         return {"bets": [], "total_points": 0}

    #     user_bets_array = self.user_bets[address]
    #     user_bets_details = []

    #     for bet_index, bet_outcome in enumerate(user_bets_array):
    #         if bet_index < len(self.bets) and bet_outcome is not None:
    #             bet = self.bets[bet_index]
    #             bet_detail = {
    #                 "bet_id": bet.id,
    #                 "bet_title": bet.title,
    #                 "user_outcome": bet_outcome,
    #                 "user_outcome_text": (
    #                     bet.possible_outcomes[bet_outcome]
    #                     if bet_outcome < len(bet.possible_outcomes)
    #                     else "Invalid"
    #                 ),
    #                 "has_resolved": bet.has_resolved,
    #                 "correct_outcome": bet.outcome if bet.has_resolved else None,
    #                 "correct_outcome_text": (
    #                     bet.possible_outcomes[bet.outcome]
    #                     if bet.has_resolved and bet.outcome < len(bet.possible_outcomes)
    #                     else None
    #                 ),
    #                 "points_earned": (
    #                     1 if bet.has_resolved and bet_outcome == bet.outcome else 0
    #                 ),
    #             }
    #             user_bets_details.append(bet_detail)

    #     return {
    #         "bets": user_bets_details,
    #         "total_points": self.overall_points.get(address, 0),
    #     }

    @gl.public.view
    def get_owner(self) -> str:
        """
        Returns the address of the contract owner.
        """
        return self.owner.as_hex

    @gl.public.write
    def place_bets(
        self,
        user_discord_handler: str,
        user_x_handler: str,
        bet_0_outcome: int,
        bet_1_outcome: int,
        bet_2_outcome: int,
    ) -> None:
        """
        Allows users to place a bet on an existing betting event.

        Args:
            user_discord_handler: Discord handler for the user
            user_x_handler: X (Twitter) handler for the user
            bet_0_outcome: The index of the outcome the user is betting on for bet 0 (0, 1, 2, etc.)
            bet_1_outcome: The index of the outcome the user is betting on for bet 1 (0, 1, 2, etc.)
            bet_2_outcome: The index of the outcome the user is betting on for bet 2 (0, 1, 2, etc.)
        """

        # Get the sender's address
        user_address = gl.message.sender_address
        if user_address in self.x_handlers:
            raise Exception("User already registered a bet")
        if user_address in self.discord_handlers:
            raise Exception("User already registered a bet")
        if user_address in self.user_bets:
            raise Exception("User already registered a bet")

        # Validate that we have exactly 3 bets
        if len(self.bets) != 3:
            raise Exception("There must be exactly 3 bets available")

        # Validate that the outcome indices are valid
        if bet_0_outcome >= len(self.bets[0].possible_outcomes):
            raise Exception(f"Invalid outcome index for bet 0: {bet_0_outcome}")
        if bet_1_outcome >= len(self.bets[1].possible_outcomes):
            raise Exception(f"Invalid outcome index for bet 1: {bet_1_outcome}")
        if bet_2_outcome >= len(self.bets[2].possible_outcomes):
            raise Exception(f"Invalid outcome index for bet 2: {bet_2_outcome}")

        self.x_handlers[user_address] = user_x_handler
        self.discord_handlers[user_address] = user_discord_handler
        self.user_bets[user_address] = [
            u256(bet_0_outcome),
            u256(bet_1_outcome),
            u256(bet_2_outcome),
        ]
