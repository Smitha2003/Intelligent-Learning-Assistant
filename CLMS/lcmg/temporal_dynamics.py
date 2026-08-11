import datetime
from models.domain import LearnerState

def apply_temporal_decay(state: LearnerState):
    """
    Simulates forgetting over time.
    If it has been a long time since last_updated, mastery drifts towards prior (0.1)
    and uncertainty increases.
    """
    now = datetime.datetime.utcnow()
    delta_days = (now - state.last_updated).days
    
    if delta_days > 0:
        # Decay factor: lose 5% confidence per day of inactivity
        decay_factor = 0.95 ** delta_days
        
        # Drift towards 0.10 prior
        drift = state.mastery - 0.10
        new_mastery = 0.10 + (drift * decay_factor)
        
        state.mastery = max(0.10, min(0.99, new_mastery))
        
        # Recompute uncertainty
        from lcmg.bayesian_updater import compute_uncertainty
        state.uncertainty = compute_uncertainty(state.mastery)
        state.last_updated = now

    return state
