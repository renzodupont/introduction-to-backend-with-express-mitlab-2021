// In case the API does not return data, this is the default:::::::::::
const products = [
  { name: "Apples", country: "Italy", cost: 3, inStock: 10 },
  { name: "Oranges", country: "Spain", cost: 4, inStock: 3 },
  { name: "Beans", country: "USA", cost: 2, inStock: 5 },
  { name: "Cabbage", country: "USA", cost: 1, inStock: 8 },
];

/////////////////////////////////////////////////////////////////// GLOBAL FUNCTIONS ////////////////////////////////////////////////
const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);
  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });

  const fetchData = async (isLocked, u) => {
    dispatch({ type: "FETCH_INIT" });
    try {
      const result = await axios(u);
      if (!isLocked) {
        dispatch({ type: "FETCH_SUCCESS", payload: result.data });
      }
    } catch (error) {
      if (!isLocked) {
        dispatch({ type: "FETCH_FAILURE" });
      }
    }
  };
  useEffect(() => {
    let lockReloadOnStateChanged = false;
    fetchData(lockReloadOnStateChanged, url);
    return () => {
      lockReloadOnStateChanged = true;
    };
  }, [url]);

  return [state, setUrl, fetchData];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};
/////////////////////////////////////////////////////////////////// GLOBAL FUNCTIONS ////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////// CART COMPONENT ////////////////////////////////////////////////
const Cart = (props) => {
  const { Card, Accordion, Button } = ReactBootstrap;
  let data = props.location.data ? props.location.data : products;

  return <Accordion defaultActiveKey="0">{list}</Accordion>;
};
/////////////////////////////////////////////////////////////////// PRODUCTS COMPONENT ////////////////////////////////////////////////
const Products = (props) => {
  const [cart, setCart] = React.useState([]);
  const [inputUrl, setInputUrl] = React.useState(
    "http://localhost:1337/products"
  );
  const { Card, Accordion, Button, Container, Row, Col, Image } =
    ReactBootstrap;
  //  Fetch Data
  const { Fragment, useState, useEffect, useReducer } = React;
  const [state, setUrl, fetchData] = useDataApi(inputUrl, products);

  /////////////////////////////////////////////////////////////////// PRODUCTS COMPONENT FUNCTIONS ////////////////////////////////////////////////
  const addToCart = (e) => {
    const itemList = state.data.filter((item) => item.name == e.target.name);
    let item = itemList[0];
    if (!item || item.inStock <= 0) return;

    item.inStock--;
    setCart([...cart, ...itemList]);
  };
  const deleteCartItem = (index) => {
    let item = cart.filter((item, i) => index === i)[0]; //Cart and items point to the same item object array
    let newCart = cart.filter((item, i) => index != i);
    if (!item) return;

    item.inStock++; //This means that by getting the item from the cart, we would be affecting the original item as well
    setCart(newCart);
  };
  const finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => {
      return (
        <div key={index} index={index}>
          {item.name}
        </div>
      );
    });
    return { final, total };
  };
  //This methods return the total of the current Checkout
  const checkOut = () => {
    let costs = cart.map((item) => item.cost);
    return costs.reduce((accum, current) => accum + current, 0);
  };
  //This would just clean the cart to allow managing a new Sale
  const performCheckout = () => {
    setCart([]);
  };
  const restockProducts = async () => {
    setUrl(inputUrl);
    // Call the fetch directly and cause the re-render by changing items
    // This is because setUrl only causes a re-render if the URL is different
    // I want to be able to re-stock any time I want even if it's from the same URL :)
    await fetchData(false, inputUrl);
  };
  /////////////////////////////////////////////////////////////////// PRODUCTS COMPONENT FUNCTIONS ////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////////// JSX VARIABLES ////////////////////////////////////////////////
  let list = state.data.map((item, index) => {
    let n = index + 1049;
    let url = "https://picsum.photos/id/" + n + "/50/50";

    return (
      <li key={index}>
        <Image src={url} width={70} roundedCircle></Image>
        <Button variant="primary" size="large">
          {item.name}: ${item.cost} - Stock: {item.inStock}
        </Button>
        <br />
        <input
          name={item.name}
          type="submit"
          onClick={addToCart}
          value="Send"
        />
      </li>
    );
  });
  let cartList = cart.map((item, index) => {
    return (
      <Card key={index}>
        <Card.Header>
          <Accordion.Toggle as={Button} variant="link" eventKey={1 + index}>
            {item.name}
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse
          onClick={() => deleteCartItem(index)}
          eventKey={1 + index}
        >
          <Card.Body>
            $ {item.cost} from {item.country}
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    );
  });
  /////////////////////////////////////////////////////////////////// JSX VARIABLES ////////////////////////////////////////////////

  return (
    <Container>
      <Row>
        <Col>
          <h1>Product List</h1>
          <ul style={{ listStyleType: "none" }}>{list}</ul>
        </Col>
        <Col>
          <h1>Cart Contents</h1>
          <Accordion>{cartList}</Accordion>
        </Col>
        <Col>
          <h1>CheckOut </h1>
          <Button onClick={performCheckout}>
            CheckOut $ {finalList().total}
          </Button>
          <div> {finalList().total > 0 && finalList().final} </div>
        </Col>
      </Row>
      <Row>
        <input
          type="text"
          value={inputUrl}
          onChange={(event) => setInputUrl(event.target.value)}
        />
        <input
          type="button"
          onClick={() => restockProducts()}
          value="ReStock Products"
        />
      </Row>
    </Container>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById("root"));
