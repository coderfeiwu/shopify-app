import {
  Card,
  Layout,
  FormLayout,
  TextField,
  Page,
  Button,
  Text
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState } from "react";
import { json } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
//import dab
import db from '../db.server'
export async function loader() {
  //get data from databse
  let settings = await db.settings.findFirst()

  return json(settings)
}

export async function action({ request }) {
  // updates persistent data
  let settings = await request.formData()

  await db.settings.upsert({
    where: {
      id: '1'
    },
    update: {
      id: '1',
      name: settings.name,
      email: settings.email
    },
    create: {
      id: '1',
      name: settings.name,
      email: settings.email
    }
  })

  return json(settings)
}
export default function AdditionalPage() {
  const settings = useLoaderData()
  const [formState, setFormState] = useState(settings)
  return (
    <Page>
      <TitleBar title="FAQ" />
      <Layout>
        <Layout.Section>
          <Card className="mt-[30px] rounded-xl">
            <Form method="POST">
              <FormLayout>
                <TextField label="Store name" name="name" value={formState?.name} onChange={(value) => { setFormState({ ...formState, name: value }) }} autoComplete="off" />
                <TextField
                  type="email"
                  name="email"
                  label="Account email"
                  value={formState?.email} onChange={(value) => { setFormState({ ...formState, email: value }) }}
                  autoComplete="email"
                />
                <Button submit={true}>Submit</Button>
              </FormLayout>
            </Form>
            <Text as="h2" className="text-2xl text-red">hello</Text>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

