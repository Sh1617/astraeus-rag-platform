def verification_agent(state):

    answer = state["answer"]

    retrieved_chunks = state["retrieved_chunks"]

    context = " ".join(retrieved_chunks).lower()

    answer_text = answer.lower()

    confidence_score = 0

    matched_words = 0

    answer_words = answer_text.split()

    for word in answer_words:

        if word in context:
            matched_words += 1

    if len(answer_words) > 0:
        confidence_score = matched_words / len(answer_words)

    if confidence_score >= 0.6:
        verification_status = "Verified"

    elif confidence_score >= 0.3:
        verification_status = "Partially Verified"

    else:
        verification_status = "Low Confidence"

    state["verification"] = {
        "confidence_score": round(confidence_score, 2),
        "status": verification_status
    }

    return state