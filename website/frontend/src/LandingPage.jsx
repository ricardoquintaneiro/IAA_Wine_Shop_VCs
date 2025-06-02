
import MyNavbar from './components/Navbar';
import MyFooter from './components/Footer';
import { Card, CardHeader, CardBody, CardFooter } from '@heroui/card';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { CiStar } from "react-icons/ci";
import { FaAward, FaTruck } from "react-icons/fa6";

// Mock wine data - replace with your actual data
const featuredWines = [
  {
    id: 1,
    name: "Château Margaux 2018",
    type: "Bordeaux Red",
    price: 299.99,
    originalPrice: 349.99,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=600&fit=crop",
    vintage: 2018,
    region: "Bordeaux, France",
    description: "Elegant and complex with notes of blackcurrant and cedar",
    inStock: true,
    isNew: false,
    onSale: true
  },
  {
    id: 2,
    name: "Barolo Riserva DOCG",
    type: "Nebbiolo",
    price: 89.99,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&h=600&fit=crop",
    vintage: 2019,
    region: "Piedmont, Italy",
    description: "Rich and powerful with earthy undertones and cherry notes",
    inStock: true,
    isNew: true,
    onSale: false
  },
  {
    id: 3,
    name: "Dom Pérignon 2012",
    type: "Champagne",
    price: 199.99,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=600&fit=crop",
    vintage: 2012,
    region: "Champagne, France",
    description: "Crisp and effervescent with delicate floral aromas",
    inStock: true,
    isNew: false,
    onSale: false
  },
  {
    id: 4,
    name: "Opus One 2020",
    type: "Cabernet Blend",
    price: 429.99,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1615730122108-78a8ad7a9040?w=400&h=600&fit=crop",
    vintage: 2020,
    region: "Napa Valley, USA",
    description: "Luxurious blend with intense fruit flavors and silky tannins",
    inStock: false,
    isNew: false,
    onSale: false
  },
  {
    id: 5,
    name: "Riesling Eiswein",
    type: "Dessert Wine",
    price: 124.99,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1572326575388-803ea382c40b?w=400&h=600&fit=crop",
    vintage: 2021,
    region: "Mosel, Germany",
    description: "Sweet and concentrated with honey and apricot flavors",
    inStock: true,
    isNew: true,
    onSale: false
  },
  {
    id: 6,
    name: "Pinot Noir Reserve",
    type: "Oregon Pinot",
    price: 67.99,
    originalPrice: 79.99,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1596142332133-327df4ac0e88?w=400&h=600&fit=crop",
    vintage: 2022,
    region: "Willamette Valley, USA",
    description: "Smooth and elegant with bright red fruit and earthy finish",
    inStock: true,
    isNew: false,
    onSale: true
  }
];

function WineCard({ wine }) {
  return (
    <Card className="max-w-[100px] bg-white border border-gray-100">
      <CardHeader className="pb-0 pt-4 px-4 relative">
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
          {wine.isNew && (
            <Chip size="sm" color="success" variant="flat">
              New
            </Chip>
          )}
          {wine.onSale && (
            <Chip size="sm" color="danger" variant="flat">
              Sale
            </Chip>
          )}
          {!wine.inStock && (
            <Chip size="sm" color="default" variant="flat">
              Out of Stock
            </Chip>
          )}
        </div>
        <div className=" overflow-hidden rounded-lg bg-gradient-to-br from-purple-50 to-pink-50">
          <img
            alt={wine.name}
            className="object-cover max-w-[300px]  h-full group-hover:scale-110 transition-transform duration-500"
            src={wine.image}
          />
        </div>
      </CardHeader>

      <CardBody className="px-4 py-3">
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <CiStar
              key={i}
              className={`h-4 w-4 ${i < Math.floor(wine.rating)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
                }`}
            />
          ))}
          <span className="text-sm text-gray-600 ml-1">({wine.rating})</span>
        </div>

        <h4 className="font-bold text-lg text-gray-800 mb-1">{wine.name}</h4>
        <p className="text-sm text-gray-500 mb-1">{wine.type} • {wine.vintage}</p>
        <p className="text-sm text-gray-600 mb-2">{wine.region}</p>
        <p className="text-sm text-gray-600 line-clamp-2">{wine.description}</p>

        <div className="flex items-center gap-2 mt-3">
          <span className="text-2xl font-bold text-purple-600">
            ${wine.price}
          </span>
          {wine.originalPrice && (
            <span className="text-lg text-gray-400 line-through">
              ${wine.originalPrice}
            </span>
          )}
        </div>
      </CardBody>

      <CardFooter className="pt-0 px-4 pb-4">
        <div className="flex gap-2">
          <Button
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
            size="sm"
            isDisabled={!wine.inStock}
          >
            {wine.inStock ? 'Add to Cart' : 'Out of Stock'}
          </Button>
          <Button
            variant="bordered"
            size="sm"
            className="border-purple-300 text-purple-600 hover:bg-purple-50"
          >
            Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function WineShopLanding() {
  return (
    <div className="flex flex-col min-h-screen">
      <MyNavbar />
      
      <main className=" p-6">
        <div className="">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Featured Wines</h2>
            <p className="text-gray-600">Discover our curated selection of premium wines</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredWines.map((wine) => (
              <WineCard key={wine.id} wine={wine} />
            ))}
          </div>
        </div>
      </main>
      
          <MyFooter />
    </div>
  );
}