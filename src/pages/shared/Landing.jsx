import LandingNavbar from "./landing/LandingNavbar";
import LandingHero from "./landing/LandingHero";
import LandingHowItWorks from "./landing/LandingHowItWorks";
import LandingPersonas from "./landing/LandingPersonas";
import LandingFAQ from "./landing/LandingFAQ";
import LandingCTA from "./landing/LandingCTA";
import LandingFooter from "./landing/LandingFooter";
import LandingSectionGlow from "./landing/LandingSectionGlow";

function Landing() {
	return (
		<div className="min-h-screen bg-white text-slate-950">
			<LandingNavbar />
			<LandingHero />
			<LandingSectionGlow />
			<LandingHowItWorks />
			<LandingSectionGlow />
			<LandingPersonas />
			<LandingSectionGlow />
			<LandingFAQ />
			<LandingCTA />
			<LandingFooter />
		</div>
	);
}

export default Landing;
