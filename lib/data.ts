export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  image: string;
  badge?: string;
  rating: number;
  reviews: number;
}

export const categories = [
  { id: "all", name: "All", icon: "🍽️" },
  { id: "burgers", name: "Burgers", icon: "🍔" },
  { id: "pizza", name: "Pizza", icon: "🍕" },
  { id: "chicken", name: "Chicken", icon: "🍗" },
  { id: "sides", name: "Sides", icon: "🍟" },
  { id: "drinks", name: "Drinks", icon: "🥤" },
  { id: "desserts", name: "Desserts", icon: "🍰" },
];

export const products: Product[] = [
  {
    id: 1,
    name: "Classic Smash Burger",
    slug: "classic-smash-burger",
    description: "Juicy double-smashed beef patties with melted cheddar, caramelized onions, pickles & our secret sauce on a toasted brioche bun.",
    price: 8.99,
    category: "burgers",
    image: "https://res.cloudinary.com/dzbdympae/image/upload/v1776961554/Reuben_Style_Hot_Dog_qkk60k.jpg",
    badge: "Bestseller",
    rating: 4.8,
    reviews: 324,
  },
  {
    id: 2,
    name: "BBQ Bacon Beast",
    slug: "bbq-bacon-beast",
    description: "Thick-cut smoky bacon, BBQ glaze, pepper jack cheese & crispy onion rings stacked on a flame-grilled patty.",
    price: 11.49,
    category: "burgers",
    image: "https://res.cloudinary.com/dzbdympae/image/upload/v1776961552/Pretzel_Bun_Dog_fgax14.jpg",
    rating: 4.7,
    reviews: 218,
  },
  {
    id: 3,
    name: "Pepperoni Lovers Pizza",
    slug: "pepperoni-lovers-pizza",
    description: "Loaded with double pepperoni, mozzarella & our signature tomato sauce on a perfectly crispy crust.",
    price: 14.99,
    category: "pizza",
    image: "https://res.cloudinary.com/dzbdympae/image/upload/v1776961551/Pepperoni_Lovers_dqwkol.jpg",
    badge: "Popular",
    rating: 4.9,
    reviews: 456,
  },
  {
    id: 4,
    name: "Original Crispy Chicken",
    slug: "original-crispy-chicken",
    description: "Golden, extra-crunchy fried chicken pieces marinated for 24hrs in our secret spice blend. Served with honey mustard.",
    price: 9.99,
    category: "chicken",
    image: "https://res.cloudinary.com/dzbdympae/image/upload/v1776961550/Original_Crispy_Chicken_pqa9m0.jpg",
    badge: "Spicy",
    rating: 4.8,
    reviews: 512,
  },
  {
    id: 5,
    name: "Quinoa Salad Bowl",
    slug: "quinoa-salad-bowl",
    description: "Healthy and delicious quinoa salad with fresh greens, cherry tomatoes, and a light vinaigrette.",
    price: 8.49,
    category: "sides",
    image: "https://res.cloudinary.com/dzbdympae/image/upload/v1776961553/Quinoa_Salad_Bowl_onlvbi.jpg",
    rating: 4.6,
    reviews: 189,
  },
  {
    id: 6,
    name: "Pasta Carbonara",
    slug: "pasta-carbonara",
    description: "Classic Italian pasta with creamy egg sauce, pancetta, and parmesan cheese.",
    price: 13.99,
    category: "sides",
    image: "https://res.cloudinary.com/dzbdympae/image/upload/v1776961551/Pasta_Carbonara_fmktj8.jpg",
    rating: 4.7,
    reviews: 245,
  },
  {
    id: 7,
    name: "Pan-Seared Sirloin",
    slug: "pan-seared-sirloin",
    description: "Tender sirloin steak pan-seared with garlic butter and fresh herbs.",
    price: 18.99,
    category: "burgers",
    image: "https://res.cloudinary.com/dzbdympae/image/upload/v1776961550/Pan-Seared_Garlic_Butter_Sirloin_ccie5p.jpg",
    rating: 4.9,
    reviews: 312,
  },
  {
    id: 8,
    name: "Salmon Nigiri",
    slug: "salmon-nigiri",
    description: "Fresh slice of salmon over pressed vinegared rice.",
    price: 6.99,
    category: "sides",
    image: "https://res.cloudinary.com/dzbdympae/image/upload/v1776961692/Salmon_Nigiri_hjomnn.jpg",
    rating: 4.8,
    reviews: 156,
  },
];
