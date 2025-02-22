import { z } from "astro/zod";
import { defineAction } from "astro:actions";
import { db, eq, Product, ProductImage } from "astro:db";
import { getSession } from "auth-astro/server";

import { v4 as UUID } from "uuid";

const MAX_FILE_SIZE = 5_000_000; // 5 MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];

export const createUpdateProduct = defineAction({
  accept: "form",
  input: z.object({
    id: z.string().optional(),
    description: z.string(),
    gender: z.string(),
    price: z.number(),
    sizes: z.string(),
    slug: z.string(),
    stock: z.number(),
    tags: z.string(),
    title: z.string(),
    type: z.string(),

    imageFiles: z
      .array(
        z
          .instanceof(File)
          .refine((file) => file.size <= MAX_FILE_SIZE, "Max image size 5MB")
          .refine((file) => {
            if (file.size === 0) return true;

            return ACCEPTED_IMAGE_TYPES.includes(file.type);
          }, `Only supported image files are valid, ${ACCEPTED_IMAGE_TYPES.join(",")}`)
      )
      .optional(),
  }),
  handler: async (form, { request }) => {
    const session = await getSession(request);
    const user = session?.user;

    if (!user) {
      throw new Error("Unauthorized");
    }

    //console.log(user);

    const { id = UUID(), imageFiles, ...rest } = form;
    rest.slug = rest.slug.toLowerCase().replaceAll(" ", "-").trim();

    const product = {
      id: id,
      user: user.id!,
      ...rest,
    };

    console.log(product);

    await db.update(Product).set(product).where(eq(Product.id, id));

    return product;
  },
});
