import argon2 from "argon2";

const hash =
  "$argon2id$v=19$m=65536,t=3,p=4$aMfanEZpyQz+2H52gCsdsQ$K71nTjfR9HYciK3INhEq/FSXTfbT5MYNEK8/1MC9EHc";
const password = "admin123";

async function test() {
  const valid = await argon2.verify(hash, password);
  console.log("Is valid:", valid);
}

test();
