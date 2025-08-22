// Contact Form Submission
document.getElementById("contactForm").addEventListener("submit", function(event) {
    event.preventDefault();

    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;

    document.getElementById("form-status").innerText = 
       ` Thanks ${name}! I'll contact you soon at ${email}.`;

    document.getElementById("contactForm").reset();
});
