// WIP
const HTMLComment = ({text}) => {
  return <div dangerouslySetInnerHTML={{ __html: `<!-- ${text} -->` }} />
}
export default HTMLComment