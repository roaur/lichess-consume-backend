// utils.ts

export async function retryOperation(operation: Function, retries = 5, delay = 100) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        if (attempt === retries) throw error;
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
  }
  