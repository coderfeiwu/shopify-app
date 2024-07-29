import {
  Card,
  Layout,
  Page,
  DataTable,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
//import dab
import db from '../db.server'
export async function loader({request}) {
  //get data from databse

  const { session } = await authenticate.admin(request);
  const shopname = session.shop
  const all_datas = await db.wishlist.findMany({
    where:{
      shop:shopname
    }
  })
  const productCountMap = all_datas.reduce((acc, wishlist) => {
    const { productId } = wishlist;
    if (acc[productId]) {
      acc[productId]++;
    } else {
      acc[productId] = 1;
    }
    return acc;
  }, {});

  // 将统计结果转换为数组格式 [{productId: count}]
  const productCountArray = Object.keys(productCountMap).map(productId => ({
    productId,
    count: productCountMap[productId]
  }));

  return json(productCountArray)
}
export async function action({ request }) {
  // updates persistent data
}
export default function AdditionalPage() {
  const all_datas = useLoaderData()
  const rows = [
  ];
  all_datas.forEach(item=>{
    rows.push([item.productId,item.count])
  })
  return (
    <Page>
      <TitleBar title="FAQ" />
      <Layout>
        <Layout.Section>
          <Card className="mt-[30px] rounded-xl">
            <h2 className="text-xl font-bold mb-[30px]">Wishlist Statistics</h2>
            <DataTable
              columnContentTypes={[
                'text',
                'numeric',
              ]}
              headings={[
                'ProductName',
                'count',

              ]}
              rows={rows}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

