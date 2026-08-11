def bayesian_update(prior_mastery: float, likelihood: float) -> float:
    """
    Core Mathematical Belief Update:
    P(M | E) = ( P(E | M) * P(M) ) / P(E)
    Where:
    - P(M) is prior_mastery
    - P(E | M) is likelihood
    - P(E) is total probability of evidence = P(E|M)P(M) + P(E|~M)P(~M)
    """
    # Probability of seeing this evidence if they DO NOT have mastery
    # For a note, maybe 0.4 (they guessed/copied). For assessment, 0.2 (lucky guess).
    # We will assume a flat P(E | ~M) for simplicity in the prototype
    p_e_not_m = 1.0 - likelihood 

    # P(M)
    p_m = prior_mastery
    # P(~M)
    p_not_m = 1.0 - p_m

    # P(E) = P(E|M)*P(M) + P(E|~M)*P(~M)
    p_e = (likelihood * p_m) + (p_e_not_m * p_not_m)

    if p_e == 0:
        return prior_mastery

    # P(M | E) = (P(E|M) * P(M)) / P(E)
    posterior = (likelihood * p_m) / p_e
    return posterior

def compute_uncertainty(mastery: float) -> float:
    """
    Equation (3) from ILA Paper:
    U_i(t) = 1 - 2 * |M_i(t) - 0.5|
    Highest uncertainty (1.0) when mastery is 0.5.
    Lowest uncertainty (0.0) when mastery is 0.0 or 1.0.
    """
    return 1.0 - 2.0 * abs(mastery - 0.5)

def apply_evidence_update(prior_mastery: float, likelihood: float) -> tuple[float, float]:
    """Applies evidence to prior mastery, returning (new_mastery, new_uncertainty)."""
    new_mastery = bayesian_update(prior_mastery, likelihood)
    # Bound it to prevent absolute 0 or 1 which breaks future updates
    new_mastery = max(0.01, min(0.99, new_mastery)) 
    new_uncertainty = compute_uncertainty(new_mastery)
    
    return new_mastery, new_uncertainty
