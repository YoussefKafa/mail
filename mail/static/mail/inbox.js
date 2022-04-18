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
          if (!emails[i].read){
              email.classList.add('seen');
          }
        email.classList.add('email');
          document.querySelector('#emails-view').append(email);
          email.addEventListener('click', () => load_email(emails[i].id, mailbox));

      };
  });
document.querySelector('#emails-view').style.display = 'block';
document.querySelector('#compose-view').style.display = 'none';
document.querySelector('#mail-view').style.display = 'none';
document.querySelector('#emails-view').innerHTML = `<h3 style="color:green; font-weight:bold;">${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}

function load_email(id, mailbox) {
  //check if it is a sent email
  let sentEmail = false;
  if (mailbox==="sent"){
      sentEmail = true;
  }
  //change the view
  document.querySelector('#mail-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  //change the state of that mail to seen
 
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
            read: false
    })
})
console.log("state changed to read")
  //fetch the email and display it
  fetch(`/emails/${id}`)
      .then(response => response.json())
      .then(email => {
          document.querySelector('#mail-view').innerHTML = `
          <div class="emailViewBorder" ><span style="color:red;"><b>From:</b></span> ${email.sender}</div>
          <div class="emailViewBorder"><span style="color:blue;"><b>To:</b></span> ${email.recipients}</div>
          <div class="emailViewBorder"><span style="color:green;"><b>Subject:</b></span> ${email.subject}</div>
          <div class="emailViewBorder"><span style="color:black;"><b>Timestamp:</b></span> ${email.timestamp}</div>            
          <hr>
          <div class="emailViewBorder">
          <h1> Email Body: </h1>
              ${email.body}
              <br>
              <br>
              <br>
              <div class="email-buttons">
              <button class="btn-email" id="reply">Reply</button>
              <button class="btn-email" id="archive">${email["archived"] ? "Unarchive" : "Archive"}</button>
              </div>
          </div> 
        `;
        //if it is a sent email , then hide the reply and archive buttons
          if (sentEmail) {document.querySelector('.email-buttons').style.display = 'none';}
        //archive the email when clicking on archive button
          document.querySelector('#archive').addEventListener('click', () => {
              fetch(`/emails/${id}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                      archived: !email.archived
                  })
              })
                  .then(email => {
                      load_mailbox('inbox');
                  });
          })
          //open a new compose view when user clicks on reply button
          document.querySelector('#reply').addEventListener('click', () => {
              document.querySelector('#emails-view').style.display = 'none';
              document.querySelector('#compose-view').style.display = 'block';
              document.querySelector('#mail-view').style.display = 'none';
              document.querySelector('#compose-recipients').value = email.sender;
              if (email.subject.slice(0,3) != "Re:") {
                  document.querySelector('#compose-subject').value = "Re:" + email.subject;
                }
              else {
                  document.querySelector('#compose-subject').value = email.subject;
              }
              document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote:\n${email.body}\n\n`;
          })
      })
}