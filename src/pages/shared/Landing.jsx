import LandingNavbar from "./landing/LandingNavbar";
import LandingHero from "./landing/LandingHero";

function Landing() {
	return (
		<div className="min-h-screen bg-white text-slate-950">
			<LandingNavbar />
			<LandingHero />
		</div>
	);
}

export default Landing;
