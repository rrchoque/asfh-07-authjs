import type { ProductWithImages } from "@/interfaces";
import { z } from "astro/zod";
import { defineAction } from "astro:actions";
import { count, db, eq, Product, ProductImage, sql } from "astro:db";

export const getProductsByPage = defineAction({
  accept: "json",
  input: z.object({
    page: z.number().optional().default(1),
    limit: z.number().optional().default(12),
  }),
  handler: async ({ page, limit }) => {
    page = page <= 0 ? 1 : page;

    const [totalRecords] = await db.select({ count: count() }).from(Product);
    const totalPages = Math.ceil(totalRecords.count / limit);

    if (page > totalPages) {
      // page = totalPages;
      return {
        products: [] as ProductWithImages[],
        totalPages: totalPages,
      };
    }

    const productsQuery = sql`
      select p.*,
      (select GROUP_CONCAT(pi.image , ',') from 
        (select * from ${ProductImage} pi2 where pi2.productId = p.id limit 2 ) pi
      ) as images
      from ${Product} p 
      LIMIT ${limit} OFFSET ${(page - 1) * limit};
    `;

    const { rows } = await db.run(productsQuery);

    console.log(rows);

    // const products = await db
    //   .select()
    //   .from(Product)
    //   .innerJoin(ProductImage, eq(Product.id, ProductImage.productId))
    //   .limit(limit)
    //   .offset((page - 1) * 12);

    return {
      products: rows as unknown as ProductWithImages[],
      totalPages: totalPages,
    };
  },
});
