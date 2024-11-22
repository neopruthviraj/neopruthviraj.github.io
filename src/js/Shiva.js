/**
 * @file Shiva.js
 * @description A JavaScript library for managing blog content and navigation with pagination and dynamic loading.
 * 
 * @author Chauhan Pruthviraj
 * @email neopruthviraj@outlook.com
 * @facebook https://facebook.com/neoprutviraj
 * @x https://x.com/neopruthviraj
 * @linkedin https://linkedin.com/in/neopruthviraj
 * @instagram https://instagram.com/neopruthviraj
 * @website https://neopruthviraj.github.io
 * 
 * @license
 * This software is licensed under a strict usage policy.
 * Unauthorized use, modification, or redistribution of this code is strictly prohibited. 
 * The code provided is intended for use only by the authorized party. 
 * Users must not claim credit for the work or represent it as their own.
 * 
 * Copyright © 2024, Chauhan Pruthviraj. All rights reserved.
 */

class Shiva {
    // Private fields to manage internal state and DOM references.
    #isNavOpen = false;
    #currentPage = 1;
    #blogsPerPage = 3;
    #blogList = [];
    #totalBlogs = 0;
    #currentTopic = 'blog';
    #currentYear = new Date().getFullYear();
    #topics = Object.freeze(['blog', 'news', 'stories']);

    // DOM element references for dynamic updates.
    #blogContainer = null;
    #fullBlogContainer = null;
    #navLinks = null;
    #prevButton = null;
    #nextButton = null;
    #pageInfo = null;
    #backButton = null;

    /**
     * @constructor
     * @param {Object} config - Configuration for initializing the blog list.
     */
    constructor(config = {}) {
        this.#blogsPerPage = config.blogsPerPage || this.#blogsPerPage;

        // DOM initialization.
        this.#blogContainer = document.getElementById("blog-container");
        this.#fullBlogContainer = document.getElementById("fullBlogContainer");
        this.#navLinks = document.querySelectorAll(".nav-link");
        this.#prevButton = document.getElementById("prev");
        this.#nextButton = document.getElementById("next");
        this.#pageInfo = document.getElementById("page-info");
        this.#backButton = document.getElementById("back-button");

        this.#setupNavigation();
        this.#setupPagination();
    }

    /**
     * @getter
     * @returns {number} Current year.
     */
    get currentYear() {
        return this.#currentYear;
    }

    /**
     * @getter
     * @returns {string} Current topic.
     */
    get currentTopic() {
        return this.#currentTopic;
    }

    /**
     * Toggles the navigation menu.
     */
    toggleNav() {
        const nav = document.querySelector(".nav");
        this.#isNavOpen ? nav.style.width = "0%" : nav.style.width = "100%";
        this.#isNavOpen = !this.#isNavOpen;
    }

    /**
     * Loads the list of blogs asynchronously and updates the UI.
     */
    async loadBlogList() {
        try {
            const response = await fetch(`/cloud/${this.#currentTopic}/${this.#currentYear}/index.json`);
            const data = await response.json();

            if (data && Array.isArray(data.blogList)) {
                this.#blogList = data.blogList;
                this.#totalBlogs = this.#blogList.length;
                this.#renderBlogList();
            } else {
                console.error("Invalid data format: 'blogList' not found.");
            }
        } catch (error) {
            console.error(`Error loading blog list for topic "${this.#currentTopic}":`, error);
        }
    }

    /**
     * Generates an HTML card for a blog item.
     * @param {Object} blog - Blog data to be displayed.
     * @returns {string} HTML string representing the blog card.
     */
    generateCard(blog) {
        let coverContent = '';

        if (blog.cover) {
            if (blog.cover.type === 'image') {
                coverContent = `<img src="${blog.cover.image.src}" alt="${blog.cover.image.alt}">`;
            } else if (blog.cover.type === 'video') {
                coverContent = `<video controls>
                                    <source src="${blog.cover.video.src}" type="video/mp4">
                                    Your browser does not support the video tag.
                                 </video>`;
            }
        }

        return `
            <div class="card">
                ${coverContent}
                <h3>${blog.title}</h3>
                <p>${blog.summary}</p>
                <button class="read-more-button" onclick="Shiva.readMore('${blog.path}')">Read More</button>
            </div>
        `;
    }

    /**
     * Renders the list of blogs on the page.
     */
    #renderBlogList() {
        const startIdx = (this.#currentPage - 1) * this.#blogsPerPage;
        const endIdx = startIdx + this.#blogsPerPage;
        const currentBlogs = this.#blogList.slice(startIdx, endIdx);

        // Clear existing content.
        this.#blogContainer.innerHTML = '';

        // Create blog cards dynamically using generateCard.
        currentBlogs.forEach(blog => {
            const blogCard = this.generateCard(blog);
            this.#blogContainer.innerHTML += blogCard;
        });

        this.#updatePagination();
    }

    /**
     * Updates pagination buttons based on current page.
     */
    #updatePagination() {
        this.#prevButton.disabled = this.#currentPage === 1;
        this.#nextButton.disabled = this.#currentPage * this.#blogsPerPage >= this.#totalBlogs;
        this.#pageInfo.textContent = `Page ${this.#currentPage}`;
    }

    /**
     * Loads the full blog content.
     * @param {string} blogPath - Path to the full blog content.
     */
    static async readMore(blogPath) {
        try {
            const response = await fetch(blogPath);
            const content = await response.text();

            const fullBlogContainer = document.getElementById("fullBlogContainer");
            fullBlogContainer.innerHTML = `
                <h2>Blog Content</h2>
                <p>${content}</p>
                <button id="back-button" onclick="Shiva.goBack()">Back</button>
            `;

            fullBlogContainer.style.display = "block";
            document.getElementById("blog-container").style.display = "none";
            document.getElementById("back-button").style.display = "block";
        } catch (error) {
            console.error("Error loading blog content:", error);
        }
    }

    /**
     * Navigates back to the blog list.
     */
    static goBack() {
        const fullBlogContainer = document.getElementById("fullBlogContainer");
        const blogContainer = document.getElementById("blog-container");
        const backButton = document.getElementById("back-button");

        fullBlogContainer.style.display = "none";
        blogContainer.style.display = "block";
        backButton.style.display = "none";
    }

    /**
     * Prints the copyright information in the footer.
     */
    static printCopyright() {
        try {
            const target = document.querySelector(".footer");
            if (target) {
                target.innerHTML = `&copy; By Pruthviraj - ${new Date().getFullYear()}`;
            }
        } catch (error) {
            console.error("Error printing copyright:", error);
        }
    }

    /**
     * Switches between blog topics.
     * @param {string} newTopic - The new topic to be displayed.
     */
    #switchTopic(newTopic) {
        if (!this.#topics.includes(newTopic)) {
            console.error(`Invalid topic: "${newTopic}".`);
            return;
        }

        this.#currentTopic = newTopic;
        this.#currentPage = 1;
        this.loadBlogList();
    }

    /**
     * Sets up event listeners for navigation links.
     */
    #setupNavigation() {
        this.#navLinks.forEach(link => {
            link.addEventListener("click", (event) => {
                const topic = event.target.dataset.topic;
                this.#switchTopic(topic);
            });
        });
    }

    /**
     * Sets up pagination controls (previous and next buttons).
     */
    #setupPagination() {
        this.#prevButton.addEventListener("click", () => {
            if (this.#currentPage > 1) {
                this.#currentPage--;
                this.#renderBlogList();
            }
        });

        this.#nextButton.addEventListener("click", () => {
            if (this.#currentPage * this.#blogsPerPage < this.#totalBlogs) {
                this.#currentPage++;
                this.#renderBlogList();
            }
        });
    }

    /**
     * Initializes the Shiva class, loads the blog list, and sets up the copyright.
     */
    initialize() {
        this.loadBlogList();
        Shiva.printCopyright();
    }
}

// Expose Shiva to the global scope and initialize on page load.
const shiva = new Shiva();
shiva.initialize();
