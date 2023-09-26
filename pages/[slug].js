import GhostContentAPI from '@tryghost/content-api';
import Link from 'next/link';
import React, { useRef, useEffect, useState } from 'react';

// Initialize the Ghost API
const api = new GhostContentAPI({
    url: process.env.GHOST_API_URL,
    key: process.env.GHOST_CONTENT_API_KEY,
    version: 'v4.0'
});

export async function getStaticPaths() {
    const posts = await api.posts.browse();

    return {
        paths: posts.map((post) => ({ params: { slug: post.slug } })),
        fallback: false,
    };
}

export async function getStaticProps({ params }) {
    const post = await api.posts.read({ slug: params.slug }, { include: 'authors,tags' });

    return {
        props: { post },
    };
}

export default function Post({ post }) {

    const [isPopupVisible, setPopupVisible] = useState(false);
    const [popupContent, setPopupContent] = useState("");
    const [popupStyle, setPopupStyle] = useState({});
    const popupRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setPopupVisible(false);
            }
        }

        // Attach the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Remove the event listener when the component unmounts
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [popupRef, isPopupVisible]);

    const handleTagClick = (event, tag) => {
        let content = "";
        if (tag === "en") {
            content = "This piece was originally written in English and has not undergone any machine translation.";
        } else if (tag === "syn-br") {
            content = "Este texto foi traduzida para uma versão sintética do português brasileiro por um modelo de inteligência artificial.";
        } else if (tag === "syn-de") {
            content = "Dieser Text wurde in eine synthetische Version des Deutschen von einem künstlichen Intelligenz-Modell übersetzt.";
        } else if (tag === "syn-es") {
            content = "Este texto fue traducido a una versión sintética del español por un modelo de inteligencia artificial.";
        } else if (tag === "syn-fr") {
            content = "Ce texte a été traduit en une version synthétique du français par un modèle d'intelligence artificielle.";
        } else if (tag === "syn-hi") {
            content = "यह लेखन एक कृत्रिम बुद्धिमत्ता मॉडल द्वारा हिंदी के एक कृत्रिम संस्करण में अनुवादित किया गया था।";
        } else if (tag === "syn-id") {
            content = "Tulisan ini diterjemahkan ke dalam versi sintetis dari Bahasa Indonesia oleh sebuah model kecerdasan buatan.";
        } else if (tag === "syn-jp") {
            content = "この文章は、人工知能モデルによって日本語の合成バージョンに翻訳されました。";
        } else if (tag === "syn-tr") {
            content = "Bu yazı, bir yapay zeka modeli tarafından Türkçe'nin sentetik bir versiyonuna çevrildi.";
        }

        if (content) {
            setPopupContent(content);

            const rect = event.target.getBoundingClientRect();
            const style = {
                top: `${rect.bottom + window.scrollY}px`,
                left: `${rect.left + window.scrollX}px`
            };
            setPopupStyle(style);

            // Show the popup
            setPopupVisible(true);
        } else {
            setPopupVisible(false);
        }
    };

    const imageURL = `/cover-photos/${post.slug}-cover.png`;

    const textRef = useRef(null);

    const scrolltoText = () => {
        const offset = 12; // Adjust this value according to your needs
        const textPosition = textRef.current.offsetTop;
        window.scrollTo({
            top: textPosition - offset,
            behavior: "smooth"
        });
    };

    useEffect(() => {
        const contentElement = document.querySelector(".markdown-content");
        if (contentElement) {
            contentElement.querySelectorAll("video").forEach(videoElement => {
                videoElement.setAttribute("controls", "true");
                videoElement.style.width = "100%";
                videoElement.style.height = "auto";
            });
        }
    }, []);

    return (
        <>
            <meta charSet="UTF-8" />
            <title>{post.title}</title>
            <link rel="stylesheet" href="/blog-style.css" />
            <link rel="stylesheet" href="https://use.typekit.net/zkz4rdl.css" />
            <div className="logo-container">
                <Link href="/">
                    <img src="/logo-white.svg" alt="Home" />
                </Link>
            </div>
            <div className="cover-container">
                <img className="cover-photo" src={imageURL} alt="Cover Photo" />
                <h1 className="cover-title">{post.title}</h1>

                {/* New Author Element */}
                <div className="author-container">
                    <img className="author-avatar" src={post.primary_author.profile_image} alt="Author Avatar" />
                    <span className="author-name">{post.primary_author.name}</span>
                </div>

                <p className="cover-excerpt">{post.excerpt}</p>
                <button className="read-more-button" onClick={scrolltoText}>Read more</button>
            </div>
            <div className="text-section" ref={textRef}>
                <div className="metadata-container">
                    <div className="publication-date">{new Date(post.published_at).toLocaleDateString()}</div>
                    {post.tags && post.tags.map((tag, index) => (
                        <span key={index} className="publication-tags" onClick={(event) => handleTagClick(event, tag.name)}>
                            {tag.name}
                        </span>

                    ))}
                    <div className="read-time">{post.reading_time} min read</div>  {/* The new read-time tag */}
                </div>
                <div className="markdown-content" dangerouslySetInnerHTML={{ __html: post.html }}></div>
            </div>
            {isPopupVisible && (
                <div className="popup" style={popupStyle} ref={popupRef}>
                    <div>{popupContent}</div>
                </div>


            )}
            <div className="copyright-footer">
                &copy; 2023 New World Person
            </div>
        </>
    );
}