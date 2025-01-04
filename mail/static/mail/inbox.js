document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const form = document.querySelector('#compose-form');

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Submit the form
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    composeFormSubmit();
    load_mailbox('sent');
  });

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Get the emails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(email => {
      const emailDiv = document.createElement('div');
      const emailClass = email.read ? 'email-read' : 'email-unread';
      emailDiv.classList.add('email');
      emailDiv.classList.add(emailClass);
      emailDiv.innerHTML = `
        <div class="email-header">
          <span class="email-sender">${email.sender}</span>
          <span class="email-subject">${email.subject}</span>
        </div>
        <div class="email-timestamp">${email.timestamp}</div>
      `;
      emailDiv.addEventListener('click', () => {
        emailOnclick(email.id);
      });
      document.querySelector('#emails-view').appendChild(emailDiv);
    });
  });
}

function composeFormSubmit() {
  // Get the form data
  const form = document.querySelector('#compose-form');
  const formData = new FormData(form);

  // Send the form data to the server
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: formData.get('recipients'),
      subject: formData.get('subject'),
      body: formData.get('body')
  })})
  .then(response => response.json())
  .then(result => {
    console.log(result);
  });

  // Prevent the form from submitting
  return false;
}

function emailOnclick(emailId) {
  fetch(`/emails/${emailId}`)
  .then(response => response.json())
  .then(email => {
    // Show the email
    document.querySelector('#email-view').innerHTML = `
      <div>
        <p class="email-sender"><strong>From:</strong> ${email.sender}</p>
        <p class="email-recipients"><strong>To:</strong> ${email.recipients.join(', ')}</p>
        <p class="email-subject"><strong>Subject:</strong> ${email.subject}</p>
        <p class="email-timestamp"><strong>Timestamp:</strong> ${email.timestamp}</p>
        <button class="btn btn-sm btn-outline-primary">Reply</button>
      </div>
      <hr>
      <div class="email-body">${email.body}</div>
    `;
  });

  fetch(`/emails/${emailId}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
  })});

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
}