def calculator_tool(expression):

    try:
        result = eval(expression)

        return str(result)

    except Exception:
        return "Invalid calculation"


def tool_agent(state):

    question = state["question"]

    # Default value
    state["tool_result"] = None

    if any(op in question for op in ["+", "-", "*", "/"]):

        result = calculator_tool(question)

        state["tool_result"] = result

    return state