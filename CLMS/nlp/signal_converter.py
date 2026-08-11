def get_likelihood_from_note(confidence: float) -> float:
    """
    Converts NLP confidence from a note into a Bayesian likelihood signal.
    Notes are weak evidence.
    Returns P(E | M), representing the likelihood of seeing this evidence if the learner mastered the concept.
    """
    # Weak evidence: If mastered, 60% chance to write this. If not mastered, 40% chance.
    # It barely nudges the belief.
    base_likelihood_if_mastered = 0.60
    # Adjust slightly based on the NLP confidence
    adjusted = base_likelihood_if_mastered + (confidence * 0.1)
    return min(adjusted, 0.99)

def get_likelihood_from_assessment(is_correct: bool) -> float:
    """
    Assessments are strong evidence.
    Returns P(E | M)
    """
    if is_correct:
        # If they mastered it, they have a 90% chance of getting it right.
        return 0.90
    else:
        # If they mastered it, they only have a 10% chance of getting it wrong (slip parameter)
        return 0.10
