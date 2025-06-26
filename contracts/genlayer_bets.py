# { "Depends": "py-genlayer:test" }

import json
import typing
import urllib.parse
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
    resolution_x_method: str
    resolution_x_parameter: (
        str  # Parameter for X API methods (user handle, tweet ID, etc.)
    )
    title: str
    description: str
    category: str
    outcome: str
    reason: str


class GenLayerBets(gl.Contract):
    bets: DynArray[Bet]
    x_handlers: TreeMap[Address, str]
    discord_handlers: TreeMap[Address, str]
    user_bets: TreeMap[Address, DynArray[str]]
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
        resolution_x_method: str,
        resolution_x_parameter: str,
        title: str,
        description: str,
        category: str,
    ) -> None:
        """
        Creates a new betting event. Only the contract owner can call this method.

        Args:
            bet_id: Unique identifier for the bet
            date: Date when the bet can be resolved (YYYY-MM-DD format)
            resolution_url: URL to check for bet resolution
            resolution_x_method: X API method to use for resolution (if no URL)
            resolution_x_parameter: Parameter for X API method (user handle, tweet ID, etc.)
            title: Title of the betting event
            description: Description of what is being bet on
        """
        self._require_owner()

        # Check if bet ID already exists
        existing_bet = next((bet for bet in self.bets if bet.id == bet_id), None)
        if existing_bet is not None:
            raise Exception(f"Bet with id {bet_id} already exists")

        # Create the new bet
        new_bet = Bet(
            id=bet_id,
            resolution_date=resolution_date,
            has_resolved=False,
            resolution_url=resolution_url,
            resolution_x_method=resolution_x_method,
            resolution_x_parameter=resolution_x_parameter,
            title=title,
            description=description,
            category=category,
            outcome="",  # Default value, will be set when resolved
            reason="",  # Default value, will be set when resolved
        )

        # Add the bet to the contract
        self.bets.append(new_bet)

    def _check_bet(self, bet: Bet) -> str:
        bet_resolution_url = bet.resolution_url
        bet_resolution_x_method = bet.resolution_x_method
        bet_resolution_x_parameter = bet.resolution_x_parameter
        bet_title = bet.title
        bet_description = bet.description

        def get_bet_result() -> str:
            # Check if we should use X API method instead of URL
            if not bet_resolution_url and bet_resolution_x_method:
                # Use X API method
                if bet_resolution_x_method == "get_user_latest_tweets":
                    if not bet_resolution_x_parameter:
                        raise Exception(
                            "X API method 'get_user_latest_tweets' requires user handle parameter"
                        )
                    tweet_data = get_user_latest_tweets(bet_resolution_x_parameter)
                    web_data = json.dumps(tweet_data, indent=2)
                elif bet_resolution_x_method == "get_tweet_data":
                    if not bet_resolution_x_parameter:
                        raise Exception(
                            "X API method 'get_tweet_data' requires tweet ID parameter"
                        )
                    tweet_data = get_tweet_data(bet_resolution_x_parameter)
                    web_data = json.dumps(tweet_data, indent=2)
                else:
                    raise Exception(f"Unknown X API method: {bet_resolution_x_method}")
            else:
                # Use the original URL-based approach
                if not bet_resolution_url:
                    raise Exception("No resolution URL or valid X API method provided")

                web_data = gl.get_webpage(bet_resolution_url, mode="text")

            task = f"""
In the following web content, you need to resolve a bet about {bet_title}: {bet_description}

The possible outcomes are: ["yes", "no"]

Web content:
{web_data}

Respond in JSON:
{{
    "outcome": str, // This should be one of the possible outcomes. e.g., "yes" or "no" 
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
            gl.eq_principle_prompt_comparative(
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
        bet.outcome = bet_status[
            "outcome"
        ].lower()  # Store as lowercase for consistency
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
                if user_bet_outcome.lower() == bet.outcome:
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
                    if (
                        bet.has_resolved
                        and user_bets_array[bet_index].lower() == bet.outcome
                    ):
                        users_points_for_this_bet[user_address.as_hex] = 1
                    else:
                        users_points_for_this_bet[user_address.as_hex] = 0

            serialized_bet = {
                "id": bet.id,
                "resolution_date": bet.resolution_date,
                "has_resolved": bet.has_resolved,
                "resolution_url": bet.resolution_url,
                "resolution_x_method": bet.resolution_x_method,
                "resolution_x_parameter": bet.resolution_x_parameter,
                "title": bet.title,
                "description": bet.description,
                "category": bet.category,
                "outcome": bet.outcome,
                "reason": bet.reason,
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

    @gl.public.view
    def get_all_user_bets(self) -> dict:
        """
        Exports all user bets in a structured format.

        Returns:
            dict: A dictionary containing all user bet information including:
                - user_addresses: List of user addresses
                - user_handlers: Dictionary mapping addresses to social handles
                - user_bet_selections: Dictionary mapping addresses to their bet selections
                - total_users: Total number of users who have placed bets
        """
        user_addresses = []
        user_handlers = {}
        user_bet_selections = {}

        for user_address, user_bets_array in self.user_bets.items():
            user_addresses.append(user_address.as_hex)

            # Get social handles
            x_handler = self.x_handlers.get(user_address, "")
            discord_handler = self.discord_handlers.get(user_address, "")
            user_handlers[user_address.as_hex] = {
                "x_handler": x_handler,
                "discord_handler": discord_handler,
            }

            # Get bet selections
            bet_selections = []
            for i, bet_outcome in enumerate(user_bets_array):
                if i < len(self.bets):
                    bet_selections.append(
                        {
                            "bet_id": self.bets[i].id,
                            "bet_title": self.bets[i].title,
                            "selected_outcome": bet_outcome,
                        }
                    )

            user_bet_selections[user_address.as_hex] = bet_selections

        return {
            "user_addresses": user_addresses,
            "user_handlers": user_handlers,
            "user_bet_selections": user_bet_selections,
            "total_users": len(user_addresses),
        }

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
        bet_0_outcome: str,
        bet_1_outcome: str,
        bet_2_outcome: str,
    ) -> None:
        """
        Allows users to place a bet on an existing betting event.

        Args:
            user_discord_handler: Discord handler for the user
            user_x_handler: X (Twitter) handler for the user
            bet_0_outcome: The outcome the user is betting on for bet 0 ("yes" or "no")
            bet_1_outcome: The outcome the user is betting on for bet 1 ("yes" or "no")
            bet_2_outcome: The outcome the user is betting on for bet 2 ("yes" or "no")
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

        # Validate that the outcomes are valid ("yes" or "no")
        valid_outcomes = ["yes", "no"]
        if bet_0_outcome.lower() not in valid_outcomes:
            raise Exception(
                f"Invalid outcome for bet 0: {bet_0_outcome}. Must be 'yes' or 'no'"
            )
        if bet_1_outcome.lower() not in valid_outcomes:
            raise Exception(
                f"Invalid outcome for bet 1: {bet_1_outcome}. Must be 'yes' or 'no'"
            )
        if bet_2_outcome.lower() not in valid_outcomes:
            raise Exception(
                f"Invalid outcome for bet 2: {bet_2_outcome}. Must be 'yes' or 'no'"
            )

        self.x_handlers[user_address] = user_x_handler
        self.discord_handlers[user_address] = user_discord_handler
        self.user_bets[user_address] = [
            bet_0_outcome.lower(),
            bet_1_outcome.lower(),
            bet_2_outcome.lower(),
        ]


def get_user_latest_tweets(user_handle: str) -> dict:
    """
    Get the latest tweets from a user using the Twitter API recent search endpoint
    """
    tweet_data = request_to_x(
        "tweets/search/recent",
        {
            "query": f"from:{user_handle}",
            "tweet.fields": "text,public_metrics",
            "sort_order": "recency",
        },
    )
    return tweet_data


def get_tweet_data(tweet_id: str) -> dict:
    """
    Get the tweet data in 1 call using the /tweet/{tweet_id} API
    NOTE: /tweet/{tweet_id} has low rate limit
    """
    tweet_data = request_to_x(
        f"tweets/{tweet_id}",
        {
            "tweet.fields": "text,public_metrics",
        },
    )
    return tweet_data


def request_to_x(
    endpoint: str, params: dict[typing.Any, typing.Any]
) -> dict[str, typing.Any]:
    proxy_url = "https://d-kol.vercel.app/api/twitter"
    base_url = f"{proxy_url}/{endpoint}"

    url = f"{base_url}?{urllib.parse.urlencode(params)}"

    def call_x_api() -> dict[str, typing.Any]:
        print(f"Requesting {url}")
        web_data = gl.get_webpage(url, mode="text")
        print(f"Response: '{web_data}'")
        # TODO: improve this to handle case when response is not a json
        # TODO: improve proxy server to return json in failure cases
        return json.loads(web_data)

    return gl.eq_principle_strict_eq(call_x_api)
