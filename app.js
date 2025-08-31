
document.getElementById('year').textContent = new Date().getFullYear();

function handleSubmit(formId){
  const form = document.getElementById(formId);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    console.log('Lead form submitted:', data);
    alert('Thanks! Your request was received. We will contact you shortly.');
    form.reset();
  });
}

handleSubmit('lead-form');
handleSubmit('cta-form');
