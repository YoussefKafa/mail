document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit = send_mail;
  load_mailbox('inbox');
});
function compose_email() {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#mail-view').style.display = 'none';
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}
function send_mail(){
  fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
      })
  }).then(response => response.json()).then(res => { load_mailbox('sent');});
  return false;
}
function load_mailbox(mailbox) {
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      for (let i of Object.keys(emails)) {
          const email = document.createElement('div');
          email.innerHTML = `
              <div><b>Subject:</b> ${emails[i].subject}</div>
              <div><b>From:</b> ${emails[i].sender}</div>
              <div><b>Date:</b> ${emails[i].timestamp}</div>
          `;
          if (emails[i].read) {
            email.classList.add('seen');
        }
        email.classList.add('email');
          document.querySelector('#emails-view').append(email);
      };
  });
document.querySelector('#emails-view').style.display = 'block';
document.querySelector('#compose-view').style.display = 'none';
document.querySelector('#mail-view').style.display = 'none';
document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}