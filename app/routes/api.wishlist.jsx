import { json } from "@remix-run/node";
import db from '../db.server'
import {cors} from 'remix-utils/cors'


export async function loader({ request }) {
  const url = new URL(request.url);
  const params = new URLSearchParams(url.search);
  const customerId = params.get('customerId');
  const productId = params.get('productId');
  const shop = params.get('shop');

  if (!customerId || !productId || !shop) {
    return json({
      ok: false,
      message: "Missing query parameters",
    }, { status: 400 });
  }

  const wishlistItems = await db.wishlist.findMany({
    where: {
      customerId,
      productId,
      shop
    }
  });
  if (wishlistItems.length > 0) {
    return json({
      ok: true,
      message: "Items found in wishlist",
      items: wishlistItems
    });
  } else {
    return json({
      ok: false,
      message: "No items found in wishlist"
    });
  }
}
export async function action({request}) {
   const method = request.method
   let data = await request.formData()
   data = Object.fromEntries(data)
   const customerId = data.customerId
   const productId = data.productId
   const shop = data.shop
   if(!customerId || !productId || !shop){
    return json({
      message:"Miss data .Required data:customerId, productId, shop ",
      method
    })
   }
   switch(method){
    case 'POST':
    const wishlist = await db.wishlist.create({
      data:{
        customerId,
        productId,
        shop
      }
    })
    const response = json({message:"Product added to wishlisist",method:"POST",wishlist,ok:true})
    return cors(request,response)
    case 'PATCH':
      return json({message:"Success",method:"PATCH"})
    case 'DELETE':
      try {
        const deletedItems = await db.wishlist.deleteMany({
          where: {
            customerId: customerId,
            productId: productId,
            shop: shop,
          },
        });
        if(deletedItems.count > 0){
          return json({
            ok: true,
            message: `${deletedItems.count} items deleted from wishlist`,
          });
        }else{
          return json({
            ok: false,
            message: "have not added to cart",
          });
        }

      } catch (error) {
        return json({
          ok: false,
          message: "Error deleting wishlist items",
        }, { status: 500 });
      } finally {
        await db.$disconnect();
      }
     default:
      return new Response("Method Noy allow",{status:405})
   }
}
