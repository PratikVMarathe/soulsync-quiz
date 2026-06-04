import Icon from './Icon';

export default function AiGuideCard() {
  return (
    <section className="quiz-ai-card">
      <div className="quiz-panel-heading">
        <Icon name="ai" size={22} />
        <h2>AI Guide</h2>
      </div>
      <p>Want to understand this deeper?<br />Ask SoulGuide about this concept.</p>
      <button className="quiz-ai-input" type="button">
        <span>Ask anything...</span>
        <Icon name="chevron" size={21} />
      </button>
    </section>
  );
}
