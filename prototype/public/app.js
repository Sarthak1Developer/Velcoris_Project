'use strict';
const menuButton=document.querySelector('#menu-toggle');
const navigation=document.querySelector('#navigation');
function closeMenu(){navigation.classList.remove('open');menuButton.setAttribute('aria-expanded','false');}
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')==='true';navigation.classList.toggle('open',!open);menuButton.setAttribute('aria-expanded',String(!open));});
navigation.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&navigation.classList.contains('open')){closeMenu();menuButton.focus();}});
const materials={flg:{code:'FLG',title:'Few-Layer Graphene',description:'A starting point for evaluating graphene in conductive, thermal and composite formulations. Suitability depends on your matrix, dispersion process and testing.',focus:'Conductivity, reinforcement and dispersion'},go:{code:'GO',title:'Graphene Oxide',description:'A starting point for exploring functionalised graphene and water-based processing. Confirm the proposed grade and compatibility with your system before evaluation.',focus:'Functionalisation, aqueous processing and matrix compatibility'}};
let selectedMaterial='flg';
document.querySelectorAll('[data-material]').forEach(button=>button.addEventListener('click',()=>{selectedMaterial=button.dataset.material;const material=materials[selectedMaterial];document.querySelectorAll('[data-material]').forEach(other=>{const active=other===button;other.classList.toggle('active',active);other.setAttribute('aria-pressed',String(active));});document.querySelector('#material-code').textContent=material.code;document.querySelector('#material-title').textContent=material.title;document.querySelector('#material-description').textContent=material.description;document.querySelector('#material-focus').textContent=material.focus;document.querySelector('#material-cta').textContent=`Evaluate ${material.code} ↗`;}));
const applications={coatings:{title:'Explore barrier and wear behaviour.',description:'For coating and lubricant projects, define the host system and the property you want to evaluate before choosing a material.',checklist:'Base resin or lubricant · Dispersion method · Corrosion or wear test · Acceptance criteria',name:'Coatings & lubricants'},energy:{title:'Investigate your electrode formulation.',description:'For energy-storage projects, define the chemistry, electrode role and test protocol. Performance depends on the full cell system.',checklist:'Cell chemistry · Electrode formulation · Cycle test protocol · Baseline performance',name:'Energy storage'},construction:{title:'Evaluate within your construction mix.',description:'For construction projects, define the binder, mixing process and durability or strength target before designing a trial.',checklist:'Binder and mix design · Mixing method · Curing conditions · Strength or durability test',name:'Construction materials'},polymers:{title:'Explore your polymer or elastomer system.',description:'For polymer projects, clarify the processing route and balance of mechanical, thermal or electrical properties you need to investigate.',checklist:'Polymer matrix · Compounding method · Target property · Control formulation',name:'Polymers & elastomers'}};
let selectedApplication='coatings';
document.querySelectorAll('[data-application]').forEach(button=>button.addEventListener('click',()=>{selectedApplication=button.dataset.application;const app=applications[selectedApplication];document.querySelectorAll('[data-application]').forEach(other=>{const active=other===button;other.classList.toggle('active',active);other.setAttribute('aria-pressed',String(active));});document.querySelector('#application-title').textContent=app.title;document.querySelector('#application-description').textContent=app.description;document.querySelector('#application-checklist').textContent=app.checklist;}));
document.querySelectorAll('[data-intent]').forEach(link=>link.addEventListener('click',()=>{document.querySelector('#intent').value=link.dataset.intent;document.querySelector('#receipt').hidden=true;document.querySelector('#enquiry-form').hidden=false;if(link.id==='material-cta')document.querySelector('#material').value=materials[selectedMaterial].code;if(link.id==='application-cta'&&!document.querySelector('#message').value)document.querySelector('#message').value=`Application: ${applications[selectedApplication].name}\nEvaluation goal: `;}));
const form=document.querySelector('#enquiry-form');
const receipt=document.querySelector('#receipt');
let requestKey=crypto.randomUUID();
form.addEventListener('input',event=>{if(event.target.setCustomValidity)event.target.setCustomValidity('');event.target.removeAttribute('aria-invalid');});
form.addEventListener('submit',async event=>{
  event.preventDefault();const name=document.querySelector('#name');const message=document.querySelector('#message');
  name.value=name.value.trim();message.value=message.value.trim();if(!form.reportValidity())return;
  const errorBox=document.querySelector('#form-error');errorBox.hidden=true;
  const data=new FormData(form);const payload=Object.fromEntries(data);payload.demoConsent=document.querySelector('#demo-consent').checked;payload.requestKey=requestKey;
  const controls=[...form.querySelectorAll('input,select,textarea,button')];controls.forEach(control=>control.disabled=true);
  const submit=form.querySelector('button[type=submit]');submit.textContent='Saving…';
  try{
    const response=await fetch('/api/enquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const result=await response.json();
    if(!response.ok){
      for(const [field,reason] of Object.entries(result.fields||{})){const element=form.elements.namedItem(field==='demoConsent'?'demo-consent':field);if(element?.setCustomValidity){element.setCustomValidity(reason);element.setAttribute('aria-invalid','true');}}
      if(response.status===409)requestKey=crypto.randomUUID();
      throw new Error(result.error||'Unable to save the enquiry. Please try again.');
    }
    const output=document.querySelector('#receipt-details');output.replaceChildren();
    for(const [label,value] of [['Name',data.get('name')],['Email',data.get('email')],['Organisation',data.get('organisation')||'Not provided'],['Enquiry type',data.get('intent')],['Material',data.get('material')],['Application & goals',data.get('message')]]){
      const row=document.createElement('div'),term=document.createElement('dt'),detail=document.createElement('dd');term.textContent=label;detail.textContent=value;row.append(term,detail);output.append(row);
    }
    document.querySelector('#saved-reference').textContent='Reference: '+result.id;
    form.hidden=true;receipt.hidden=false;receipt.setAttribute('tabindex','-1');receipt.focus();
  }catch(error){errorBox.textContent=error instanceof TypeError?'The connection failed. Your entries are still here; retry to check or save the same request.':error.message;errorBox.hidden=false;errorBox.setAttribute('tabindex','-1');errorBox.focus();}
  finally{controls.forEach(control=>control.disabled=false);submit.textContent='Save demo enquiry ↗';}
});
document.querySelector('#edit-enquiry').addEventListener('click',()=>{form.reset();requestKey=crypto.randomUUID();receipt.hidden=true;form.hidden=false;document.querySelector('#form-error').hidden=true;form.querySelectorAll('[aria-invalid]').forEach(element=>{element.removeAttribute('aria-invalid');element.setCustomValidity('');});document.querySelector('#name').focus();});
