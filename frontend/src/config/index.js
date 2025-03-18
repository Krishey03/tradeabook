export const registerFormControls = [
    {
        name: "userName",
        label: "Username",
        type: "input",
        placeholder: "Enter your username",
        componentType: "input",
    },
    {
        name: "email",
        label: "Email",
        type: "input",
        placeholder: "Enter your email",
        componentType: "input",
    },
    {
        name: "password",
        label: "Password",
        placeholder: "Enter your password",
        componentType: "input",
        type: "password",
    },
    {
        name: "phone",
        label: "Phone",
        placeholder: "Phone No",
        componentType: "input",
        type: "String",
    },
    {
        name: "address",
        label: "Address",
        placeholder: "Enter your address",
        componentType: "input",
        type: "String",
    },

]

export const loginFormControls = [

    {
        name: "email",
        label: "Email",
        type: "input",
        placeholder: "Enter your email",
        componentType: "input",
    },
    {
        name: "password",
        label: "Password",
        placeholder: "Enter your password",
        componentType: "input",
        type: "password",
    },
    
];

export const addProductFormElements = [
  {
    label: "Title",
    name: "title",
    componentType: "input",
    type: "text",
    placeholder: "Enter product title",
  },
  {
    label: "Description",
    name: "description",
    componentType: "textarea",
    placeholder: "Enter product description",
  },
  {
    label: "Author",
    name: "author",
    componentType: "text",
    placeholder: "Enter author name",
  },
  {
    label: "ISBN",
    name: "isbn",
    componentType: "input",
    type: "number",
    placeholder: "Enter ISBN number",
  },
  {
    label: "Publisher",
    name: "publisher",
    componentType: "text",
    placeholder: "Enter publisher name",
  },
  {
    label: "Publication Date",
    name: "publicationDate",
    componentType: "input",
    type: "date",
    placeholder: "Enter publication date",
    onFocus: (e) => e.target.removeAttribute('readonly'),
  },
  {
    label: "Edition",
    name: "edition",
    componentType: "text",
    placeholder: "Enter edition",
  },
  {
    label: "Min Bid",
    name: "minBid",
    componentType: "input",
    type: "number",
    placeholder: "Enter minimum bid price",
  },
];

export const exchangeProductFormElements = [
  {
    label: "Title",
    name: "eTitle",
    componentType: "input",
    type: "text",
    placeholder: "Enter product title",
  },
  {
    label: "Description",
    name: "eDescription",
    componentType: "textarea",
    placeholder: "Enter product description",
  },
  {
    label: "Author",
    name: "eAuthor",
    componentType: "text",
    placeholder: "Enter author name",
  },
  {
    label: "ISBN",
    name: "eIsbn",
    componentType: "text",
    placeholder: "Enter ISBN number",
  },
  {
    label: "Publisher",
    name: "ePublisher",
    componentType: "text",
    placeholder: "Enter publisher name",
  },
  {
    label: "Publication Date",
    name: "ePublicationDate",
    componentType: "text",
    placeholder: "Enter publication date",
  },
  {
    label: "Edition",
    name: "eEdition",
    componentType: "text",
    placeholder: "Enter edition",
  },
];

export const shoppingViewHeaderMenuItems = [
  {
    id: "home",
    label: "Home",
    path: "/shop/home",
  },
  {
    id: "products",
    label: "Products",
    path: "/shop/listing",
  },
  {
    id: "about",
    label: "About",
    path: "/shop/about",
  },
  {
    id: "search",
    label: "Search",
    path: "/shop/search",
  },
];






