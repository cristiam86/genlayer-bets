from gltest import get_contract_factory, default_account
from gltest.helpers import load_fixture
from gltest.assertions import tx_execution_succeeded, tx_execution_failed


def deploy_contract():
    factory = get_contract_factory("GenLayerBets")
    contract = factory.deploy()

    # Get Initial State
    contract_all_points_state = contract.get_points(args=[])
    assert contract_all_points_state == {}

    contract_all_bets_state = contract.get_bets(args=[])
    assert contract_all_bets_state == []

    # Verify owner is set correctly
    owner_address = contract.get_owner(args=[])
    assert owner_address == default_account.address

    return contract


# def test_create_bet_success():
#     """Test successful bet creation by owner"""
#     contract = load_fixture(deploy_contract)

#     # Create a bet
#     create_bet_result = contract.create_bet(
#         args=[
#             "test_bet_1",
#             "2025-06-04",
#             "https://www.fifa.com/en/match-centre/match/520/288301/288302/400017744?date=2025-06-04",
#             "Football match between Barbados and Aruba",
#             "Who will win the match between Barbados and Aruba?",
#             ["Barbados", "Aruba", "Draw"],
#         ]
#     )
#     assert tx_execution_succeeded(create_bet_result)

#     # Verify bet was created
#     bets = contract.get_bets(args=[])
#     assert len(bets) == 1
#     assert bets[0]["id"] == "test_bet_1"
#     assert bets[0]["title"] == "Football match between Barbados and Aruba"
#     assert bets[0]["has_resolved"] == False
#     assert bets[0]["possible_outcomes"] == ["Barbados", "Aruba", "Draw"]


# def test_create_bet_duplicate_id_fails():
#     """Test that creating a bet with duplicate ID fails"""
#     contract = load_fixture(deploy_contract)

#     # Create first bet
#     create_bet_result = contract.create_bet(
#         args=[
#             "duplicate_bet",
#             "2025-06-15",
#             "https://example.com/resolution",
#             "First Bet",
#             "First bet description",
#             ["Yes", "No"],
#         ]
#     )
#     assert tx_execution_succeeded(create_bet_result)

#     # Try to create bet with same ID - should fail
#     tx_receipt = contract.create_bet(
#         args=[
#             "duplicate_bet",
#             "2025-06-16",
#             "https://example.com/resolution2",
#             "Second Bet",
#             "Second bet description",
#             ["Option 1", "Option 2"],
#         ]
#     )
#     tx_execution_failed(tx_receipt)


# def test_create_bet_insufficient_outcomes_fails():
#     """Test that creating a bet with less than 2 outcomes fails"""
#     contract = load_fixture(deploy_contract)

#     # Try to create bet with only 1 outcome - should fail
#     tx_receipt = contract.create_bet(
#         args=[
#             "single_outcome_bet",
#             "2025-06-15",
#             "https://example.com/resolution",
#             "Invalid Bet",
#             "Bet with single outcome",
#             ["Only Option"],
#         ]
#     )
#     tx_execution_failed(tx_receipt)


# def test_place_bet_success():
#     """Test successful bet placement by user"""
#     contract = load_fixture(deploy_contract)

#     # Create a bet first
#     contract.create_bet(
#         args=[
#             "place_bet_test",
#             "2025-06-15",
#             "https://example.com/resolution",
#             "Place Bet Test",
#             "Test placing bets",
#             ["Option A", "Option B", "Option C"],
#         ]
#     )

#     # Place a bet
#     place_bet_result = contract.place_bet(
#         args=["place_bet_test", 1]
#     )  # Betting on "Option B"
#     assert tx_execution_succeeded(place_bet_result)

#     # Verify bet was placed
#     bets = contract.get_bets(args=[])
#     bet = bets[0]
#     assert default_account.address in bet["users_bets"]
#     assert bet["users_bets"][default_account.address] == 1


# def test_place_bet_invalid_bet_id_fails():
#     """Test that placing bet on non-existent bet fails"""
#     contract = load_fixture(deploy_contract)

#     # Try to place bet on non-existent bet
#     tx_receipt = contract.place_bet(args=["non_existent_bet", 0])
#     tx_execution_failed(tx_receipt)


# def test_place_bet_invalid_outcome_index_fails():
#     """Test that placing bet with invalid outcome index fails"""
#     contract = load_fixture(deploy_contract)

#     # Create a bet with 2 outcomes
#     contract.create_bet(
#         args=[
#             "invalid_index_test",
#             "2025-06-15",
#             "https://example.com/resolution",
#             "Invalid Index Test",
#             "Test invalid outcome index",
#             ["Yes", "No"],
#         ]
#     )

#     # Try to place bet with invalid outcome index (2, when only 0 and 1 are valid)
#     tx_receipt = contract.place_bet(args=["invalid_index_test", 2])
#     tx_execution_failed(tx_receipt)


# def test_place_bet_duplicate_fails():
#     """Test that placing multiple bets by same user on same event fails"""
#     contract = load_fixture(deploy_contract)

#     # Create a bet
#     contract.create_bet(
#         args=[
#             "duplicate_place_test",
#             "2025-06-15",
#             "https://example.com/resolution",
#             "Duplicate Place Test",
#             "Test duplicate bet placement",
#             ["Option A", "Option B"],
#         ]
#     )

#     # Place first bet
#     contract.place_bet(args=["duplicate_place_test", 0])

#     # Try to place second bet - should fail
#     tx_receipt = contract.place_bet(args=["duplicate_place_test", 1])
#     tx_execution_failed(tx_receipt)


def test_resolve_bet_success_correct_prediction():
    """Test successful bet resolution with correct user prediction"""
    contract = load_fixture(deploy_contract)

    # Create a bet
    contract.create_bet(
        args=[
            "test_bet_1",
            "2025-06-04",
            "https://www.fifa.com/en/match-centre/match/520/288301/288302/400017744?date=2025-06-04",
            "Football match between Barbados and Aruba",
            "Who will win the match between Barbados and Aruba?",
            ["Barbados", "Aruba", "Draw"],
        ]
    )

    # Place a bet
    contract.place_bet(args=["test_bet_1", 2])  # Betting on Draw

    # Resolve the bet
    resolve_bet_result = contract.resolve_bet(
        args=["test_bet_1"],
        wait_interval=10000,  # 10000 ms = 10 seconds
        wait_retries=15,
    )
    assert tx_execution_succeeded(resolve_bet_result)

    # Check if bet was resolved
    bets = contract.get_bets(args=[])
    bet = bets[0]
    assert bet["has_resolved"] == True
    assert bet["reason"] != ""

    # Check points (this will depend on the actual resolution result)
    player_points = contract.get_player_points(args=[default_account.address])
    # Points will be 1 if prediction was correct, 0 if wrong
    assert player_points >= 0


# def test_resolve_bet_invalid_bet_id_fails():
#     """Test that resolving non-existent bet fails"""
#     contract = load_fixture(deploy_contract)

#     # Try to resolve non-existent bet
#     tx_receipt = contract.resolve_bet(args=["non_existent_bet"])
#     tx_execution_failed(tx_receipt)


# def test_resolve_bet_already_resolved_fails():
#     """Test that resolving already resolved bet fails"""
#     contract = load_fixture(deploy_contract)

#     # Create and resolve a bet
#     contract.create_bet(
#         args=[
#             "already_resolved_test",
#             "2024-06-15",  # Past date
#             "https://example.com/resolution",
#             "Already Resolved Test",
#             "Test already resolved bet",
#             ["Yes", "No"],
#         ]
#     )

#     # Resolve the bet first time
#     contract.resolve_bet(
#         args=["already_resolved_test"],
#         wait_interval=10000,
#         wait_retries=15,
#     )

#     # Try to resolve again - should fail
#     tx_receipt = contract.resolve_bet(args=["already_resolved_test"])
#     tx_execution_failed(tx_receipt)


# def test_get_points_empty():
#     """Test getting points when no bets resolved"""
#     contract = load_fixture(deploy_contract)

#     points = contract.get_points(args=[])
#     assert points == {}


# def test_get_player_points_no_points():
#     """Test getting player points when player has no points"""
#     contract = load_fixture(deploy_contract)

#     player_points = contract.get_player_points(args=[default_account.address])
#     assert player_points == 0


# def test_ai_model_bet_scenario():
#     """Test the AI model betting scenario"""
#     contract = load_fixture(deploy_contract)

#     # Create AI model bet
#     contract.create_bet(
#         args=[
#             "new_ai_model_surpass_o3",
#             "2025-06-20",  # Future date to allow bet placement
#             "https://openai.com/research/",
#             "New AI Model Surpassing OpenAI's o3",
#             "Will any provider release an AI model with more than 70 Artificial Intelligence before June 20, surpassing OpenAI's o3 model?",
#             ["Yes", "No"],
#         ]
#     )

#     # Place a bet on "Yes"
#     contract.place_bet(args=["new_ai_model_surpass_o3", 0])

#     # Verify bet placement
#     bets = contract.get_bets(args=[])
#     assert len(bets) == 1
#     assert bets[0]["id"] == "new_ai_model_surpass_o3"
#     assert default_account.address in bets[0]["users_bets"]
#     assert bets[0]["users_bets"][default_account.address] == 0


# def test_genlayer_ama_bet_scenario():
#     """Test the GenLayer AMA betting scenario"""
#     contract = load_fixture(deploy_contract)

#     # Create GenLayer AMA bet
#     contract.create_bet(
#         args=[
#             "genlayer_ama_340_members",
#             "2025-06-30",  # Future date to allow bet placement
#             "https://x.com/Cryptony09",
#             "Genlayer AMA Membership Milestone",
#             "Will one Genlayer AMA surpass more than 340 members according to @Cryptony09's post from X?",
#             ["Yes", "No"],
#         ]
#     )

#     # Place a bet on "No"
#     contract.place_bet(args=["genlayer_ama_340_members", 1])

#     # Verify bet placement
#     bets = contract.get_bets(args=[])
#     assert len(bets) == 1
#     assert bets[0]["id"] == "genlayer_ama_340_members"
#     assert default_account.address in bets[0]["users_bets"]
#     assert bets[0]["users_bets"][default_account.address] == 1


# def test_multiple_bets_and_users():
#     """Test scenario with multiple bets and multiple users"""
#     contract = load_fixture(deploy_contract)

#     # Create multiple bets
#     contract.create_bet(
#         args=[
#             "bet_1",
#             "2025-06-15",
#             "https://example.com/bet1",
#             "First Bet",
#             "First betting event",
#             ["A", "B"],
#         ]
#     )

#     contract.create_bet(
#         args=[
#             "bet_2",
#             "2025-06-16",
#             "https://example.com/bet2",
#             "Second Bet",
#             "Second betting event",
#             ["X", "Y", "Z"],
#         ]
#     )

#     # Place bets
#     contract.place_bet(args=["bet_1", 0])  # Bet on A
#     contract.place_bet(args=["bet_2", 2])  # Bet on Z

#     # Verify multiple bets exist
#     bets = contract.get_bets(args=[])
#     assert len(bets) == 2

#     # Verify user has placed bets on both
#     bet_1 = next(bet for bet in bets if bet["id"] == "bet_1")
#     bet_2 = next(bet for bet in bets if bet["id"] == "bet_2")

#     assert default_account.address in bet_1["users_bets"]
#     assert default_account.address in bet_2["users_bets"]
#     assert bet_1["users_bets"][default_account.address] == 0
#     assert bet_2["users_bets"][default_account.address] == 2
