import * as argon2 from "argon2";

async function test() {
  try {
    const password = "password123";
    const hash = await argon2.hash(password);
    console.log("Hash:", hash);
    const valid = await argon2.verify(hash, password);
    console.log("Valid:", valid);
  } catch (e) {
    console.error("Argon2 Error:", e);
  }
}

test();
