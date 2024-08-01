import {
  Card,
  Layout,
  Page,
  Button,
} from "@shopify/polaris";
import { useCallback, useState } from "react";
import { TitleBar} from '@shopify/app-bridge-react';
import { json } from "@remix-run/node";
import { useLoaderData,Link } from "@remix-run/react";
import { authenticate } from "../shopify.server";
//import dab
import db from "../db.server";
export async function loader({ request }) {
  return {};
}
export async function action({ request }) {}
export default function AdditionalPage() {
  return (
    <Page>
      <TitleBar title="Discount" />
      <Layout>
        <Layout.Section>
          <Card className="mt-[30px] rounded-xl">
            <h2 className="text-xl font-bold mb-[30px]">Wishlist Statistics</h2>
            <div className="w-full mb-2 flex items-center justify-end">
              {/* <Button onClick={handleChange}>Add product</Button> */}
            </div>
          </Card>
          <Link to="/app/discount/new">
            <Button>Add product</Button>
          </Link>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
