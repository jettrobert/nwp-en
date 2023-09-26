import React, { useEffect, useRef } from 'react';
import Head from 'next/head';
import api from '../lib/ghost';
import { useRouter } from 'next/router';

const MyBlog = ({ posts }) => {
  const router = useRouter();
  const containerRef = useRef(null);

  const loadPost = (slug) => {
    router.push(`/${slug}`);
  };

  useEffect(() => {
    function updateTimes() {
      const timeContainer = document.getElementById("time-container");
      const timeZones = [
        { label: "LA", offset: -7 },
        { label: "NYC", offset: -4 },
        { label: "LONDON", offset: 1 },
        { label: "BERLIN", offset: 2 },
        { label: "MUMBAI", offset: 5.5 },
        { label: "TOKYO", offset: 9 },
      ];

      const timeStrings = timeZones.map(zone => {
        const now = new Date();
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        const localTime = new Date(utc + (3600000 * zone.offset));
        const timeString = localTime.toTimeString().split(" ")[0].substring(0, 5);
        return `${zone.label} ${timeString}`;
      });

      timeContainer.innerHTML = timeStrings.join(" ");

    }

    updateTimes();
    const timerID = setInterval(updateTimes, 60000);

    return () => {
      clearInterval(timerID);

    };
  }, []);


  useEffect(() => {
    const container = containerRef.current;
    let boxes = container.querySelectorAll('.box');
    let scrolling;

    // Initial focus
    if (boxes.length > 0) {
      boxes[0].classList.add('focused');
    }

    const handleScroll = () => {
      clearTimeout(scrolling);

      scrolling = setTimeout(() => {
        let closestBox = null;
        let closestDistance = Infinity;

        boxes.forEach((box) => {
          const rect = box.getBoundingClientRect();
          const absDistance = Math.abs(window.innerWidth / 2 - (rect.left + rect.right) / 2);
          console.log("Box:", box);  // Logs each box element
          console.log("absDistance:", absDistance);  // Logs the calculated distance for each box


          if (absDistance < closestDistance) {
            closestDistance = absDistance;
            closestBox = box;
          }
        });

        console.log("Closest Box:", closestBox);  // Logs the closest box element
        console.log("Closest Distance:", closestDistance);  // Logs the closest distance


        boxes.forEach((box => box.classList.remove('focused')));
        closestBox.classList.add('focused');
      }, 200);
    };

    container.addEventListener('scroll', handleScroll);

    // Cleanup
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []); // empty array to only run once

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <link rel="stylesheet" href="/styles.css" />
        <link rel="stylesheet" href="https://use.typekit.net/zkz4rdl.css" />
      </Head>
      <div
        id="time-container"
      >
        {/* Time will be inserted here by JavaScript */}
      </div>
      <div className="scrolling-text-container">
        <div className="scrolling-text">
          WELCOME TO THE NEW WORLD CONTENT SYSTEM. THE FUTURE IS OURS. FOLLOW US ON INSTAGRAM TO STAY UPDATED.  
        </div>
      </div>
      <div className="container" ref={containerRef}>
        <div className="box-spacer" />
        {posts.map((post, index) => (
          <div key={index} className="box" onClick={() => loadPost(post.slug)}>
            <div
              className="image"
              style={{ backgroundImage: `url(${post.feature_image})` }}
            />
          </div>
        ))}
        <div className="box-spacer" />
      </div>

      <div id="links-container">
        <a href="https://www.instagram.com/new_world_person/" target="_blank" rel="noopener noreferrer">
          INSTAGRAM
        </a>
        <span className="divider"> | </span>
        <a href="https://www.newworldperson.com" target="_blank" rel="noopener noreferrer">
          READ IN OTHER LANGUAGES
        </a>
        <span className="divider">|</span>
        <a href="https://www.instagram.com/new_world_person/" target="_blank" rel="noopener noreferrer">
          CONTACT US
        </a>
      </div>

      <img id="bottom-logo" src="/logo-white.svg" alt="New World Person" />
    </>
  );
};


export default MyBlog;

export async function getStaticProps() {
  let posts = [];

  try {
    posts = await api.posts.browse({
      limit: 15, // Feel free to adjust the limit
      filter: 'tags: [en]'
    });
  } catch (error) {
    console.error(error);
  }

  return {
    props: { posts },
  };
}