import GhostContentAPI from '@tryghost/content-api';
import Link from 'next/link';
import React, { useRef } from 'react';

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
    const post = await api.posts.read({ slug: params.slug }, { include: 'tags' });

    return {
        props: { post },
    };
}

export default function Post({ post }) {

    console.log(post);  // This will log the tags to the console

    const imageURL = `/cover-photos/${post.slug}-cover.png`;

    const textRef = useRef(null);

    const scrolltoText = () => {
        const offset = 10; // Adjust this value according to your needs
        const textPosition = textRef.current.offsetTop;
        window.scrollTo({
            top: textPosition - offset,
            behavior: "smooth"
        });
    };
    
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
                <p className="cover-excerpt">{post.excerpt}</p>
                <button className="read-more-button" onClick={scrolltoText}>Read more</button>
            </div>
            <div className="text-section" ref={textRef}>
                <div className="metadata-container">
                    <p className="publication-date">{new Date(post.published_at).toLocaleDateString()}</p>
                    {post.tags && post.tags.map((tag, index) => (
                        <span key={index} className="publication-tags">{tag.name}</span>
                    ))}
                </div>
                <div className="markdown-content" dangerouslySetInnerHTML={{ __html: post.html }}></div>
            </div>

        </>
    );
}