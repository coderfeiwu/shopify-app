import { useState, useEffect, useCallback, useRef } from "react";
import {
  Modal,
  Button,
  AppProvider,
  TextField,
  Checkbox,
} from "@shopify/polaris";
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
  const [currentProduct, setCurrentProduct] = useState(null);
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
      console.log(currentProductId.current);
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
        setCurrentProduct(product);
        setAddIndex(addindex + 1);
      }
    });
    setActive(false);
  };
  // Fetch products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `https://est-nervous-pda-hard.trycloudflare.com/api/getproductbypage?shop=${shop.name}`,
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

  return (
    <AppProvider>
      <div style={{ margin: "20px" }}>
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
      <div className="w-full p-[20px] flex items-center gap-8 ">
        <div className="w-[300px] h-[300px] flex justify-center items-center relative">
          {!currentProduct ? (
            <div className="w-full h-full flex justify-center items-center bg-blue-200">
              <span className="text-md">haven't choose product</span>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center">
              <svg
                t="1722506322003"
                className="w-[20px] h-[20px] absolute top-[10px] right-[10px] cursor-pointer"
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
                src={currentProduct.img}
              ></img>
              <span className="mt-2 w-full text-center text-lg">
                {currentProduct.title}
              </span>
              <span className="mt-2 w-full text-lg text-center text-red-600">
                {currentProduct.price}
                {currentProduct.currencyCode}
              </span>
            </div>
          )}
        </div>
      </div>
    </AppProvider>
  );
}
