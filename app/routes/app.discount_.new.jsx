import { useState, useEffect, useCallback, useRef } from "react";
import {
  Modal,
  Button,
  AppProvider,
  TextField,
  Checkbox,
  FormLayout,
  Select,
} from "@shopify/polaris";
import DateRangePicker from "../component/DateRangePciker";
import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
// Loader function to get data from the database
export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  const shopname = session.shop;
  return json({ name: shopname });
}

export default function NewDiscount() {
  const [active, setActive] = useState(false);
  const handleChange = () => setActive(!active);
  const shop = useLoaderData();
  const currentProductId = useRef(null);
  const [currentProducts, setCurrentProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [addindex, setAddIndex] = useState(0);
  const [choosed, setChoosed] = useState(new Array(10).fill(false));
  const checkChange = useCallback(
    (index, id) => {
      const tempArr = [...choosed];
      tempArr.forEach((_, i) => {
        if (index != i) {
          tempArr[i] = false;
        }
      });
      tempArr[index] = !tempArr[index];
      currentProductId.current = id;

      setChoosed(tempArr);
    },
    [choosed],
  );
  const cancel = () => {
    setActive(false);
    setChoosed(new Array(10).fill(false));
    currentProductId.current = null;
  };
  const comfirm = () => {
    products.forEach((item) => {
      if (item.node.id === currentProductId.current) {
        const product = {
          img: item.node?.featuredImage?.src ?? "",
          id: item.node.id,
          title: item.node.title,
          price: item.node.priceRange?.maxVariantPrice?.amount ?? "00.00",
          currencyCode: item.node.priceRange?.maxVariantPrice.currencyCode,
        };
        setChoosed(new Array(10).fill(false));
        setCurrentProducts([...currentProducts, product]);
        setAddIndex(addindex + 1);
      }
    });
    setActive(false);
  };
  const [formData, setFormData] = useState({
    discount_title: "",
    discount_type: "persent",
    discount_pirce: "",
    start: "",
    end: "",
    usageLimit: 0,
  });
  // Fetch products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `https://satisfied-conventions-theatre-justin.trycloudflare.com/api/getproductbypage?shop=${shop.name}`,
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setProducts(data.data); // Assuming your API returns data in the format { data: [...] }
      } catch (error) {
        console.log(error);
      }
    };
    fetchProducts();
  }, [shop.name]);

  const handleSelectChange = useCallback(
    (value) => setFormData(...formData, { discount_type: value }),
    [],
  );
  const options = [
    { label: "Persent discount", value: "persent" },
    { label: "Amount discount", value: "amount" },
  ];
  return (
    <AppProvider>
      <div style={{ margin: "20px" }}>
        <div className="w-full py-[30px]">
          <FormLayout>
            <TextField
              type="text"
              label="Dicount title"
              value={formData.discount_title}
              onChange={(value) => {
                setFormData({ ...formData, discount_title: value });
              }}
              autoComplete="off"
            />
            <FormLayout.Group>
              <Select
                label="Date range"
                options={options}
                onChange={handleSelectChange}
                value={formData.discount_type}
              />
              <TextField
                type="text"
                label="Discount price"
                onChange={(value) => {
                  setFormData({ ...formData, discount_pirce: value });
                }}
                value={formData.discount_pirce}
                autoComplete="off"
              />
            </FormLayout.Group>
            <FormLayout.Group>
              <div className="flex items-center">
                <span className="mr-[20px]">choose date:</span>
                <DateRangePicker setupDate={setFormData} formdata={formData} />
              </div>
              <TextField
                type="number"
                label="Discount count"
                onChange={(value) => {
                  setFormData({ ...formData, usageLimit: value });
                }}
                value={formData.usageLimit}
                autoComplete="off"
              />
            </FormLayout.Group>
          </FormLayout>
        </div>
        <div className="flex w-full justify-end">
          <Button onClick={handleChange}>add product</Button>
        </div>
        <Modal
          open={active}
          onClose={handleChange}
          title="New discount Product"
          primaryAction={{
            content: "comfirm",
            onAction: comfirm,
          }}
          secondaryActions={[
            {
              content: "cancel",
              onAction: cancel,
            },
          ]}
        >
          <Modal.Section>
            <TextField
              label="Search"
              placeholder="Search products"
              clearButton
            />
            <div className="flex flex-col gap-4">
              {products &&
                products.map((item, index) => (
                  <div
                    className="flex justify-between gap-5 mt-7 items-center"
                    key={item.node.id}
                  >
                    <Checkbox
                      checked={choosed[index]}
                      onChange={() => checkChange(index, item.node.id)}
                    />
                    <img
                      className="w-[75px] h-[75px] object-cover border"
                      src={item.node?.featuredImage?.src ?? ""}
                      alt=""
                    />
                    <span className="w-30">
                      {item.node.priceRange?.maxVariantPrice?.amount ?? "00.00"}
                      {item.node.priceRange?.maxVariantPrice.currencyCode}
                    </span>
                    <span className="flex-1 flex justify-end pr-[20px]">
                      {item.node.title ?? "no name"}
                    </span>
                  </div>
                ))}
            </div>
          </Modal.Section>
        </Modal>
      </div>
      <div className="w-full p-[20px] flex  items-stretch gap-8 ">
        <div className="w-full  rounded-md flex gap-[20px]  flex-wrap items-center overflow-hidden relative">
          {!currentProducts.length ? (
            <div className="w-full h-[400px] flex justify-center items-center bg-gray-200">
              <span className="text-xl">haven't choose product</span>
            </div>
          ) : (
            <>
              {currentProducts.map((item, index) => {
                return (
                  <div
                    key={index}
                    className="flex flex-col h-full justify-between relative w-[240px] gap-2 flex-shrink-0  items-center"
                  >
                    <svg
                      t="1722506322003"
                      className="w-[20px] h-[20px] absolute top-[10px] right-[32px] cursor-pointer"
                      viewBox="0 0 1024 1024"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      p-id="4248"
                      width="20"
                      height="20"
                    >
                      <path
                        d="M885.314 835.089l-329.395-329.396 329.395-329.396c12.128-12.128 12.128-31.792 0-43.919-12.127-12.128-31.792-12.128-43.919 0l-329.396 329.396-329.396-329.396c-12.128-12.128-31.792-12.128-43.919 0s-12.128 31.792 0 43.919l329.395 329.396-329.395 329.396c-12.128 12.128-12.128 31.793 0 43.919 12.128 12.128 31.792 12.128 43.919 0l329.396-329.396 329.396 329.396c12.128 12.128 31.793 12.128 43.919 0 12.128-12.127 12.128-31.792 0-43.919z"
                        fill=""
                        p-id="4249"
                      ></path>
                    </svg>
                    <img
                      className="w-[200px] h-[200px] object-cover rounded-md"
                      width={200}
                      height={200}
                      alt=""
                      src={item.img}
                    ></img>
                    <span className="mt-2 w-full text-center text-lg">
                      {item.title}
                    </span>
                    <span className="mt-2 w-full text-lg text-center text-red-600">
                      {item.price}
                      {item.currencyCode}
                    </span>
                    <Button>change</Button>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
      <div className="w-full pb-[40px] flex justify-center">
        <Button
          disabled={
            (currentProducts.length == 0 && !formData.title) ||
            !formData.discount_pirce ||
            !formData.start ||
            !formData.end
          }
          onClick={() => {
            console.log(formData);
          }}
        >
          create a discount
        </Button>
      </div>
    </AppProvider>
  );
}
