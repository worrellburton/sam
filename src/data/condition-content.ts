// FAQs displayed on each /conditions/[slug] page. Keyed by slug.
// Lives in /data so the page itself can stay a pure Server Component.

export interface ConditionFaq {
  question: string;
  answer: string;
}

export const conditionFaqs: Record<string, ConditionFaq[]> = {
  "rotator-cuff-tears": [
    {
      question: "What are the treatment options for a rotator cuff tear?",
      answer: "Treatment depends on the severity of the tear. Small or partial tears often respond well to physical therapy, anti-inflammatory medications, and corticosteroid injections. Larger or complete tears may require arthroscopic surgical repair to reattach the tendon to the bone, especially in active patients who need full shoulder function.",
    },
    {
      question: "How long does recovery take after rotator cuff surgery?",
      answer: "Most patients wear a sling for 4 to 6 weeks after arthroscopic rotator cuff repair, followed by guided physical therapy. Full recovery and return to sports or heavy lifting typically takes 4 to 6 months, though some complex repairs may require up to 9 months for complete healing.",
    },
    {
      question: "When should I see a doctor for shoulder pain from a possible rotator cuff tear?",
      answer: "You should see an orthopedic specialist if you experience persistent shoulder pain that worsens at night, weakness when lifting or rotating your arm, or a sudden loss of shoulder motion after an injury. Early diagnosis with imaging such as an MRI can prevent further damage and improve treatment outcomes.",
    },
  ],
  "shoulder-instability-and-dislocations": [
    {
      question: "What causes shoulder instability and recurrent dislocations?",
      answer: "Shoulder instability occurs when the ligaments, labrum, or joint capsule are stretched or torn, often from a traumatic dislocation or repetitive overhead motions. Once the shoulder dislocates, the supporting structures may not heal properly, making future dislocations more likely, especially in younger and more active patients.",
    },
    {
      question: "What surgical options are available for chronic shoulder instability?",
      answer: "Arthroscopic Bankart repair is the most common procedure, reattaching the torn labrum to the socket rim using suture anchors. In cases with significant bone loss, a Latarjet procedure may be recommended, which transfers a small piece of bone to restore the socket's stability. Dr. Elguizaoui will determine the best approach based on imaging and your activity level.",
    },
    {
      question: "How long is recovery after shoulder stabilization surgery?",
      answer: "After arthroscopic stabilization, patients typically wear a sling for 4 to 6 weeks and begin physical therapy shortly after surgery. Return to contact sports or overhead activities usually takes 4 to 6 months, and adherence to the rehabilitation program is critical for preventing re-injury.",
    },
  ],
  "labral-tears-slap-tears": [
    {
      question: "What is a SLAP tear and how is it diagnosed?",
      answer: "A SLAP (Superior Labrum Anterior and Posterior) tear is a specific type of labral tear at the top of the shoulder socket where the biceps tendon attaches. It is diagnosed through a combination of physical examination, specific provocative tests, and MRI arthrography, which uses contrast dye to improve visualization of the labral tissue.",
    },
    {
      question: "Do all labral tears require surgery?",
      answer: "Not all labral tears require surgery. Mild tears or those in less active patients can often be managed with physical therapy, activity modification, and anti-inflammatory treatments. Surgery is typically recommended when conservative treatment fails to relieve symptoms, or for athletes and active individuals who need full overhead shoulder function.",
    },
    {
      question: "What is the recovery timeline after labral tear repair?",
      answer: "After arthroscopic labral repair, a sling is worn for approximately 4 weeks while the repair heals. Physical therapy begins early with gentle range-of-motion exercises, progressing to strengthening over 3 to 4 months. Most patients return to full activity, including sports, within 5 to 6 months.",
    },
  ],
  "acl-tears-and-reconstruction": [
    {
      question: "What are the signs of an ACL tear and how is it treated?",
      answer: "Common signs include a popping sensation at the time of injury, rapid knee swelling, instability or the knee giving way, and difficulty bearing weight. While partial tears may be treated with bracing and physical therapy, complete ACL tears in active individuals typically require surgical reconstruction using a graft to restore knee stability.",
    },
    {
      question: "What graft options are used in ACL reconstruction?",
      answer: "The most common graft options include patellar tendon autograft, hamstring tendon autograft, and quadriceps tendon autograft, all taken from the patient's own body. Allograft tissue from a donor is also available and may be preferred in certain situations. Dr. Elguizaoui will discuss the advantages of each option based on your age, activity level, and goals.",
    },
    {
      question: "How long does ACL reconstruction recovery take before returning to sports?",
      answer: "ACL reconstruction recovery follows a structured rehabilitation protocol lasting 6 to 9 months before clearance for return to pivoting and cutting sports. Early phases focus on reducing swelling and restoring range of motion, while later phases emphasize strength, agility, and sport-specific training. Functional testing is used to confirm readiness before return to play.",
    },
  ],
  "meniscus-tears": [
    {
      question: "What are the treatment options for a meniscus tear?",
      answer: "Treatment depends on the tear's size, location, and pattern. Small tears in the outer portion of the meniscus may heal with rest, ice, and physical therapy. Larger or symptomatic tears often require arthroscopic surgery, where the torn portion is either repaired with sutures or partially trimmed to relieve catching and pain.",
    },
    {
      question: "What is the difference between a meniscus repair and a meniscectomy?",
      answer: "A meniscus repair stitches the torn tissue back together, preserving the meniscus and its protective cushioning role in the knee. A partial meniscectomy removes the damaged portion when repair is not feasible due to tear pattern or poor blood supply. Whenever possible, repair is preferred because it protects the knee from accelerated cartilage wear over time.",
    },
    {
      question: "When should I see a doctor for knee pain that might be a meniscus tear?",
      answer: "You should seek evaluation if you experience knee swelling, locking or catching sensations, difficulty fully straightening the knee, or persistent pain along the joint line. These symptoms suggest a meniscus tear that could worsen without treatment. An MRI can confirm the diagnosis and help guide the most appropriate treatment plan.",
    },
  ],
  "patellar-instability": [
    {
      question: "What causes the kneecap to dislocate and how is it treated?",
      answer: "Patellar dislocation occurs when the kneecap shifts out of its groove on the femur, often due to a twisting injury, ligament laxity, or anatomical factors such as a shallow groove or misalignment. First-time dislocations are typically treated with bracing and physical therapy, while recurrent instability may require surgical procedures such as MPFL reconstruction to stabilize the kneecap.",
    },
    {
      question: "What is MPFL reconstruction for patellar instability?",
      answer: "MPFL (medial patellofemoral ligament) reconstruction is a surgical procedure that replaces the torn ligament responsible for holding the kneecap in its proper position. A small tendon graft is used to recreate the ligament, restoring stability and preventing future dislocations. This procedure is highly effective for patients with recurrent patellar instability.",
    },
    {
      question: "How long is recovery after patellar stabilization surgery?",
      answer: "Recovery after MPFL reconstruction typically involves 2 to 4 weeks of limited weight-bearing with crutches, followed by progressive physical therapy. Most patients regain full range of motion by 3 months and return to sports between 5 and 7 months. Consistent rehabilitation is essential for restoring quadriceps strength and preventing re-injury.",
    },
  ],
  "knee-cartilage-injuries": [
    {
      question: "What are the treatment options for knee cartilage damage?",
      answer: "Treatment ranges from conservative approaches like physical therapy, anti-inflammatory medications, and viscosupplementation injections to surgical interventions for larger or symptomatic defects. Surgical options include microfracture, osteochondral autograft transfer (OATS), and autologous chondrocyte implantation (ACI), chosen based on defect size, location, and patient activity demands.",
    },
    {
      question: "Can damaged knee cartilage heal on its own?",
      answer: "Articular cartilage has very limited ability to heal on its own because it lacks a direct blood supply. Small defects may remain asymptomatic, but larger areas of damage typically progress over time, causing pain, swelling, and mechanical symptoms. Early intervention with cartilage restoration procedures can help prevent further joint deterioration and delay or avoid the need for joint replacement.",
    },
    {
      question: "When should I see a specialist for a knee cartilage injury?",
      answer: "You should consult an orthopedic specialist if you experience persistent knee pain, swelling that recurs after activity, a grinding or catching sensation, or progressive difficulty with stairs and squatting. An MRI can reveal the extent of cartilage damage, and early treatment provides the best opportunity for cartilage preservation and restoration.",
    },
  ],
  "biceps-tendon-injuries": [
    {
      question: "What are the symptoms of a biceps tendon injury?",
      answer: "Biceps tendon injuries typically cause sudden sharp pain in the front of the shoulder or elbow, bruising that travels down the arm, and weakness with lifting or twisting motions. A visible bulge or change in the contour of the biceps muscle, sometimes called a 'Popeye deformity,' may also appear if the tendon ruptures completely.",
    },
    {
      question: "Does a biceps tendon tear always require surgery?",
      answer: "Not always. Proximal biceps tendon tears at the shoulder can often be treated conservatively in older or less active patients with minimal functional loss. However, distal biceps tendon tears at the elbow almost always require surgical repair to restore full forearm rotation and elbow flexion strength, especially in active individuals.",
    },
    {
      question: "What is the recovery time after biceps tendon repair surgery?",
      answer: "After surgical repair, a brace or sling is worn for 4 to 6 weeks to protect the healing tendon. Gentle range-of-motion exercises begin early, progressing to strengthening over 3 to 4 months. Most patients return to full activities, including lifting and sports, within 4 to 6 months following a structured rehabilitation program.",
    },
  ],
};
