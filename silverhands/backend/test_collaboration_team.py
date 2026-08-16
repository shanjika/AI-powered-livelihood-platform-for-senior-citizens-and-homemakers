import sys

sys.path.append('.')

from opportunity_matcher import recommend_collaboration_team


def test_recommend_collaboration_team_matches_target_capacity_and_includes_saranya():
    result = recommend_collaboration_team('opp-madurai-pottery', target_capacity=3)

    assert result['target_capacity'] == 3
    assert len(result['members']) == 3
    assert any(member['name'] == 'Saranya' for member in result['members'])
    assert 'AI Team Assembled' in result.get('status', '')
