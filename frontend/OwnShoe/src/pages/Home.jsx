import Header from "../components/Header";
import Hero from "../components/Hero";
import Categories from "../components/Categories";
import NewArrivals from "../components/NewArrivals";
import PromoBanner from "../components/PromoBanner";
import Features from "../components/Features";
import Reviews from "../components/Reviews";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";

function Home() {
  return (
    <div className="ownshoe-page">

      <Header />

      <main>

        <Hero />

        <Categories />

        <NewArrivals />

        <PromoBanner />

        <Features />

        <Reviews />

        <Newsletter />

      </main>

      <Footer />

    </div>
  );
}

export default Home;