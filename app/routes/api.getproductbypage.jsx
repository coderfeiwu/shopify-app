import { unauthenticated } from "../shopify.server";
import { json } from "@remix-run/node";

export async function loader({ request }) {
  const url = new URL(request.url);
  const params = new URLSearchParams(url.search);
  const shop = params.get("shop");
  const page = parseInt(params.get("page") ?? 1);

  // 获取storefront对象
  const { storefront } = await unauthenticated.storefront(shop);
  if (!storefront) {
    throw new Error("Storefront not found");
  }
  // 每页获取的产品数量
  const first = 10;
  // 初始化变量
  let endCursor = null;
  let allProducts = [];
  let hasNextPage = true;
  try {
    for (let i = 1; i <= page && hasNextPage; i++) {
      // 发送GraphQL请求
      const response = await storefront.graphql(
        `#graphql
        query getProducts($first: Int, $after: String) {
          products(first: $first, after: $after) {
            edges {
              node {
                featuredImage {
                  src
                }
                title
                id
                priceRange {
                  maxVariantPrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }`,
        {
          variables: {
            first,
            after: endCursor,
          },
        },
      );
      const res = await response.json();
      // 检查响应
      if (!res) {
        throw new Error("No res from GraphQL");
      }

      // 打印整个响应以进行调试
      console.log("GraphQL res:", res);

      if (res.errors) {
        throw new Error(
          `GraphQL error: ${res.errors.map((error) => error.message).join(", ")}`,
        );
      }

      if (!res.data || !res.data.products) {
        throw new Error("Invalid res format");
      }

      const products = res.data.products.edges;
      const pageInfo = res.data.products.pageInfo;

      if (i === page) {
        allProducts = products;
      }

      endCursor = pageInfo.endCursor;
      hasNextPage = pageInfo.hasNextPage;

      // Log the current state
      console.log(
        `Page ${i} fetched, endCursor: ${endCursor}, hasNextPage: ${hasNextPage}`,
      );
    }

    // 返回结果
    return json({
      data: allProducts,
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return json(
      { error: `Error fetching products: ${error.message}` },
      { status: 500 },
    );
  }
}
