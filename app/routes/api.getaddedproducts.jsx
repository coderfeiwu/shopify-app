import { json } from "@remix-run/node";
import db from '../db.server'
import { cors } from 'remix-utils/cors'
import { unauthenticated } from '../shopify.server'

export async function action({ request }) {
    const method = request.method
    let data = await request.formData()
    data = Object.fromEntries(data)
    const customerId = data.customerId
    const shop = data.shop
    const wishlists_products = await db.wishlist.findMany({
        where: {
            customerId,
            shop: shop
        },
        select: {
            productId: true
        }
    })

    const ids = []
    wishlists_products.map(item => {
        ids.push(`gid://shopify/Product/${item.productId}`)
    })
    const { storefront } = await unauthenticated.storefront(shop);

    const response = await storefront.graphql(
        `#graphql
               query getProductsByIds($ids: [ID!]!) {
                nodes(ids: $ids) {
                    ... on Product {
                    id
                    title
                    productType
                    variants(first: 1) {
                        edges {
                        node {
                            priceV2 {
                            amount
                            currencyCode
                            }
                        }
                        }
                    }
                    featuredImage {
                        id
                        altText
                        originalSrc
                    }
                    }
                }
                }
            `, {
        variables: {
            ids
        }
    }
    );
    let res
    try {
        res = await response.json();
    }
    catch {
        return json({
            status: 404,
        })
    }
    if (!customerId || !shop) {
        return json({
            message: "Miss data .Required data:customerId, productId, shop ",
            method
        })
    }
    switch (method) {
        case 'POST':
            if (res.data.nodes.length > 0) {
                return json({
                    status: 200,
                    data: res.data.nodes
                })
            } else {
                return json({
                    status: 201,
                    message: "no wishlisted product"
                })
            }

        default:
            return new Response("Method Noy allow", { status: 405 })
    }
}
