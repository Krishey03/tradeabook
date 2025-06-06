export const registerFormControls = [
  {
    name: "userName",
    label: "Username",
    type: "text",
    placeholder: "Enter your username",
    componentType: "input",
    validate: (value) => {
      if (!value) return "Username is required";
      if (value.length < 3) return "Username must be at least 3 characters";
      if (!/^[a-zA-Z0-9_]+$/.test(value)) 
        return "Username can only contain letters, numbers, and underscores";
      return null;
    },
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "Enter your email",
    componentType: "input",
    validate: (value) => {
      if (!value) return "Email is required";
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value))
        return "Invalid email address";
      return null;
    },
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
    validate: (value) => {
      if (!value) return "Password is required";
      if (value.length < 6) return "Password must be at least 6 characters";
      if (!/[A-Z]/.test(value)) 
        return "Password must contain at least one uppercase letter";
      if (!/[0-9]/.test(value)) 
        return "Password must contain at least one number";
      return null;
    },
  },
  {
    name: "phone",
    label: "Phone",
    placeholder: "Phone No",
    componentType: "input",
    type: "tel",
    validate: (value) => {
      if (!value) return "Phone number is required";
      if (!/^[0-9]{10}$/.test(value))
        return "Invalid phone number (10 digits required)";
      return null;
    },
  },
  {
    name: "address",
    label: "Address",
    placeholder: "Enter your address",
    componentType: "input",
    type: "text",
    validate: (value) => {
      if (!value) return "Address is required";
      if (value.length < 10) 
        return "Address must be at least 10 characters";
      return null;
    },
  },
];

export const loginFormControls = [
  {
    name: "email",
    label: "Email",
    type: "input",
    placeholder: "Enter your email",
    componentType: "input",
    validate: (value) => {
      if (!value) return "Email is required";
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
        return "Invalid email address";
      }
      return null;
    },
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
    validate: (value) => {
      if (!value) return "Password is required";
      if (value.length < 6) {
        return "Password must be at least 6 characters";
      }
      return null;
    },
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
    componentType: "number",
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
    componentType: "input",
    type: "date",
    placeholder: "Enter publication date",
    onFocus: (e) => e.target.removeAttribute('readonly'),
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
];






