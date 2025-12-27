/**
 * Maps backend error messages to user-friendly messages.
 * Catches raw SQL errors, internal errors, and common auth errors.
 */
export function getFriendlyErrorMessage(error: unknown): string {
  let message = "";

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  } else {
    return "Something went wrong. Please try again.";
  }

  const lowerMessage = message.toLowerCase();

  // SQL errors - hide technical details
  if (lowerMessage.includes("sqlstate") || lowerMessage.includes("sql")) {
    return "We're experiencing technical difficulties. Please try again later.";
  }

  // Relation/table doesn't exist
  if (lowerMessage.includes("relation") && lowerMessage.includes("does not exist")) {
    return "We're experiencing technical difficulties. Please try again later.";
  }

  // Column errors
  if (lowerMessage.includes("column") && lowerMessage.includes("does not exist")) {
    return "We're experiencing technical difficulties. Please try again later.";
  }

  // Internal server errors
  if (lowerMessage.includes("[internal]") || lowerMessage.includes("internal error")) {
    return "Something went wrong on our end. Please try again.";
  }

  // Auth-specific errors
  if (lowerMessage.includes("user already exists") || lowerMessage.includes("already_exists")) {
    return "An account with this email already exists. Try signing in instead.";
  }

  if (lowerMessage.includes("invalid credentials") || lowerMessage.includes("wrong password")) {
    return "Invalid email or password. Please check and try again.";
  }

  if (lowerMessage.includes("user not found") || lowerMessage.includes("no user")) {
    return "No account found with this email. Please sign up first.";
  }

  if (lowerMessage.includes("email not verified")) {
    return "Please verify your email before signing in.";
  }

  if (lowerMessage.includes("account disabled") || lowerMessage.includes("account locked")) {
    return "Your account has been disabled. Please contact support.";
  }

  if (lowerMessage.includes("too many attempts") || lowerMessage.includes("rate limit")) {
    return "Too many attempts. Please wait a few minutes and try again.";
  }

  if (lowerMessage.includes("network") || lowerMessage.includes("fetch")) {
    return "Connection error. Please check your internet and try again.";
  }

  if (lowerMessage.includes("timeout")) {
    return "Request timed out. Please try again.";
  }

  // If the message is already user-friendly (short and without tech jargon), use it
  if (
    message.length < 100 &&
    !lowerMessage.includes("error:") &&
    !lowerMessage.includes("exception")
  ) {
    return message;
  }

  // Fallback
  return "Something went wrong. Please try again.";
}
