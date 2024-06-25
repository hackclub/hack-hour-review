// WIP
const reactComment = ({text}) => {
  return <div dangerouslySetInnerHTML={{
    __html: `
    !<--${text}-->
  ` }}
  />
}