
import "../Style/Donation.css";

import {SectionTitle} from "../Components/SectionTitle";
import {StepCard} from "../Components/StepCard";
import {NGOCard} from "../Components/NGOCard";

export const Donate = () => {

    const ngos = [
        {
            category: "FOOD DISTRIBUTION",
            name: "Helping Hands Foundation",
            description:
                "Works to provide nutritious meals and essential food supplies to underprivileged communities.",
            location: "Mumbai"
        },

        {
            category: "HUNGER RELIEF",
            name: "Annadaan Initiative",
            description:
                "Connects surplus food with communities and individuals facing food insecurity.",
            location: "Thane"
        },

        {
            category: "COMMUNITY SUPPORT",
            name: "Food For All Trust",
            description:
                "Supports local communities by collecting and redistributing safe surplus food.",
            location: "Navi Mumbai"
        }
    ];


    return (
        <>


            {/* =========================
                 HERO SECTION
            ========================== */}

            <section className="donation-hero">

                <div className="hero-content">

                    <span className="hero-tag">
                        MAKE A DIFFERENCE
                    </span>

                    <h1>
                        Turn Surplus Food Into
                        <span> Hope.</span>
                    </h1>

                    <p>
                        Your surplus food can become a meaningful meal
                        for someone who needs it. Connect with trusted
                        NGOs and help reduce food waste while supporting
                        your community.
                    </p>

                    <button
                        className="hero-btn"
                        onClick={() =>
                            document
                                .getElementById("ngos")
                                .scrollIntoView({
                                    behavior: "smooth"
                                })
                        }
                    >
                        Find an NGO
                    </button>

                </div>

            </section>


            {/* =========================
                 DONATION INTRO
            ========================== */}

            <section className="donation-intro">

                <SectionTitle
                    className="section-heading"
                    label="DONATION"
                    title="Give Food. Create Impact."
                    description="Every donation helps reduce unnecessary food waste and ensures surplus food reaches people who need it."
                />


                {/* Donation Stats */}

                <div className="donation-stats">

                    <div className="donation-stat">
                        <h3>1,250+</h3>
                        <p>Meals Donated</p>
                    </div>

                    <div className="donation-stat">
                        <h3>85+</h3>
                        <p>Active Donors</p>
                    </div>

                    <div className="donation-stat">
                        <h3>18</h3>
                        <p>Partner NGOs</p>
                    </div>

                    <div className="donation-stat">
                        <h3>640 kg</h3>
                        <p>Food Recovered</p>
                    </div>

                </div>

            </section>


            {/* =========================
                 HOW DONATION WORKS
            ========================== */}

            <section className="how-section">

                <SectionTitle
                    className="section-heading"
                    label="HOW IT WORKS"
                    title="Donate in Three Simple Steps"
                />


                <div className="steps-container">

                    <StepCard
                        number="01"
                        title="Choose an NGO"
                        description="Browse our list of verified NGOs and choose an organization that matches your preferred cause."
                    />

                    <StepCard
                        number="02"
                        title="Donate"
                        description="Select the amount or food quantity you would like to contribute and submit your donation."
                    />

                    <StepCard
                        number="03"
                        title="Create Impact"
                        description="Your contribution helps provide meals to people while preventing usable food from becoming waste."
                    />

                </div>

            </section>


            {/* =========================
                 NGO SECTION
            ========================== */}

            <section
                className="ngo-section"
                id="ngos"
            >

                <SectionTitle
                    className="section-heading"
                    label="OUR PARTNERS"
                    title="Support a Trusted NGO"
                    description="Choose an NGO and make a contribution to help fight hunger and reduce food waste."
                />


                <div className="ngo-container">

                    {ngos.map((ngo) => (
                        <NGOCard
                            key={ngo.name}
                            {...ngo}
                        />
                    ))}

                </div>

            </section>


            {/* =========================
                 FINAL CTA
            ========================== */}

            <section className="donation-cta">

                <h2>
                    One Meal Can Make a Difference.
                </h2>

                <p>
                    Don't let good food go to waste. Help us create a
                    community where surplus food reaches those who need it.
                </p>

                <button
                    className="hero-btn"
                    onClick={() =>
                        document
                            .getElementById("ngos")
                            .scrollIntoView({
                                behavior: "smooth"
                            })
                    }
                >
                    Donate Food
                </button>

            </section>

        </>
    );
};
