import Link from "next/link";
import Accordion from "../components/ui/Accordion";
import Heading from "../components/ui/Heading";
import Panel from "../components/ui/Panel";

const FAQPage = () => {
  return (
    <section className="p-4">
      <Heading>Frequently Asked Questions</Heading>
      <Panel className="">
        <Accordion heading="What is this?">
          <p>
            Killcam.GG is a community-first platform for sharing and reviewing
            Call of Duty: Warzone builds. We&apos;re a small team of developers
            and gamers who are passionate about the game and want to make it
            easier for everyone to do their best on the battlefield.
          </p>
        </Accordion>
        <Accordion heading="How do I increase my rank?">
          <p>
            Rank is determined by your profile score, which is calculated by how
            many contributions you&apos;ve made to the site. The more you
            contribute, the higher your rank will be!
          </p>
          <p>
            Submitting, reviewing, and rating builds all contribute to your
            profile score. You will also gain points for every rating and review
            you receive on your own builds.
          </p>
          <p>Here&apos;s a list of all available ranks:</p>
          <ul className="list-inside list-disc">
            <li>Scrub (0 - 20 points)</li>
            <li>Noob (21 - 50 points)</li>
            <li>Rookie (51 - 80 points)</li>
            <li>Cracked (81 - 100 points)</li>
            <li>Goated (100+ points)</li>
          </ul>
        </Accordion>
        <Accordion heading="How many builds can I submit?">
          <p>
            You can submit as many builds as you want! However, in an effort to
            limit spam, you are limited to only having a maximum of three builds
            pending approval at any given time.
          </p>
          <p>
            Once those builds are approved by a moderator, you will be able to
            submit more!
          </p>
        </Accordion>
        <Accordion heading="Can I submit a full loadout with builds and equipment?">
          <p>
            At the moment this is not possible, but is planned for a future
            update!
          </p>
        </Accordion>
        <Accordion heading="I need help / I have an idea. How can I contact you?">
          <p>
            Please direct all website questions to any of my social accounts{" "}
            <Link
              href="/pkmninja"
              className="text-orange-600 underline transition-all hover:text-orange-500"
            >
              linked here
            </Link>
            .
          </p>
        </Accordion>
      </Panel>
    </section>
  );
};

export default FAQPage;
