import { useState } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '@heroui/card';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { CiStar } from "react-icons/ci";
import wine1 from '../src/assets/wines_photos/vc-ACN257172.webp';
import wine2 from "../src/assets/wines_photos/vc-BCH882319.webp";
import wine3 from "../src/assets/wines_photos/vc-FLC552271.webp";
import wine4 from "../src/assets/wines_photos/vc-LVM449210.webp";
import wine5 from "../src/assets/wines_photos/vc-RTB330908.webp";
import wine6 from "../src/assets/wines_photos/vc-ZYN641034.webp";
import MyNavbar from './components/Navbar';
import MyFooter from './components/Footer';
import VC_Modal from './components/VC_Modal';

const featuredWines = [
  {
    id: 1,
    name: "Pomadão Alvarinho",
    type: "White",
    price: 299.99,
    originalPrice: 349.99,
    rating: 4.9,
    image: wine1,
    vintage: 2023,
    region: "Minho, Portugal",
    description: "Elegant and complex with notes of blackcurrant and cedar",
    inStock: true,
    isNew: false,
    onSale: true,
    VC: 'vc-ACN257172',
    VP: 'vp-ACN257172'
  },
  {
    id: 2,
    name: "Vale Secreto Tinto",
    type: "Red",
    price: 89.99,
    rating: 4.7,
    image: wine2,
    vintage: 2022,
    region: "Borba, Portugal",
    description: "Rich and powerful with earthy undertones and cherry notes",
    inStock: true,
    isNew: true,
    onSale: false,
    VC: 'vc-BCH882319',
    VP: 'vp-BCH882319'
  },
  {
    id: 3,
    name: "Flor do Campo Branco",
    type: "White",
    price: 199.99,
    rating: 4.8,
    image: wine3,
    vintage: 2023,
    region: "Palmela, Portugal",
    description: "Crisp and effervescent with delicate floral aromas",
    inStock: true,
    isNew: false,
    onSale: false,
    VC: 'vc-FLC552271',
    VP: 'vp-FLC552271'
  },
  {
    id: 4,
    name: "Solar da Serra Branco",
    type: "White",
    price: 429.99,
    rating: 4.9,
    image: wine4,
    vintage: 2023,
    region: "Dão, Portugal",
    description: "Luxurious blend with intense fruit flavors and silky tannins",
    inStock: false,
    isNew: false,
    onSale: false,
    VC: 'vc-LVM449210',
    VP: 'vp-LVM449210'
  },
  {
    id: 5,
    name: "Castelo Forte Reserva",
    type: "Red",
    price: 124.99,
    rating: 4.6,
    image: wine5,
    vintage: 2021,
    region: "Tomar, Portugal",
    description: "Smooth and elegant with bright red fruit and earthy finish",
    inStock: true,
    isNew: true,
    onSale: false,
    VC: 'vc-RTB330908',
    VP: 'vp-ZYN641034'
  },
  {
    id: 6,
    name: "Encosta Rosé",
    type: "Rosé",
    price: 67.99,
    originalPrice: 79.99,
    rating: 4.5,
    image: wine6,
    vintage: 2023,
    region: "Bucelas, Portugal",
    description: "Sweet and concentrated with honey and apricot flavors",
    inStock: true,
    isNew: false,
    onSale: true,
    VC: 'vc-ZYN641034',
    VP: 'vp-ZYN641034'
  }
];

function WineCard({ wine, onShowDetails }) {
  return (
    <div className="h-full">
      <Card className="shadow-2xl bg-white border border-gray-100 h-full flex flex-col hover:scale-105 hover:shadow-3xl transition-all duration-300 ease-in-out cursor-pointer">
        <CardHeader className="pb-0 pt-2 px-4 relative">
          <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
            {wine.isNew && (
              <Chip size="lg" color="success" variant="flat">
                New
              </Chip>
            )}
            {wine.onSale && (
              <Chip size="lg" color="danger" variant="flat">
                Sale
              </Chip>
            )}
            {!wine.inStock && (
              <Chip size="lg" color="default" variant="flat">
                Out of Stock
              </Chip>
            )}
          </div>
          <div className="">
            <img
              alt={wine.name}
              className="object-cover scale-75 group-hover:scale-110 transition-transform duration-500"
              src={wine.image}
            />
          </div>
        </CardHeader>
        <CardBody className="px-4 pt-0 pb-2 flex-1">
          <div className="flex items-center mb-2">
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

          <div className="flex items-center gap-2 mt-auto pt-3">
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

        <CardFooter className="pt-0 px-4 pb-4 mt-auto">
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
              onPress={() => onShowDetails(wine)}
            >
              Details
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function WineShopLanding() {
  const [selectedWine, setSelectedWine] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleShowDetails = (wine) => {
    setSelectedWine(wine);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedWine(null);
  };

  return (
    <div className="flex flex-col min-h-screen">

      <MyNavbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Featured Wines</h2>
            <p className="text-gray-600">Discover our curated selection of premium wines</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredWines.map((wine) => (
              <WineCard
                key={wine.id}
                wine={wine}
                onShowDetails={handleShowDetails}
              />
            ))}
          </div>
        </div>
      </main>

      <MyFooter />

      {/* Verification Modal */}
      {selectedWine && (
        <VC_Modal
          wine={selectedWine}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}