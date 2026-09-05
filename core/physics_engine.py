def calculate_shadow_relief(altitude_H: float, shadow_length_Ls: float, slant_range_R: float) -> float:
    """
    Computes physical target elevation off the seafloor using acoustic shadow geometry:
    h = (H * Ls) / (R + Ls)
    """
    denom = slant_range_R + shadow_length_Ls
    if denom == 0:
        return 0.0
    return (altitude_H * shadow_length_Ls) / denom
