import './index.scss';

const TagBadge = ({ tag, onClick })=>{
  return (
    <span key={tag} className="tag-badge badge rounded-pill" onClick={onClick}>{tag}</span>
  );
};

export default TagBadge;
