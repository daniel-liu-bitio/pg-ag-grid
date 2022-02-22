import { useState } from 'react'

export default function ScrollSelectionForm(props) {
    const scrollOptionArray = ['Result Preview', 'Limited Scroll', 'Windowed Scroll']
    const [scrollOption, setScrollOption] = useState(scrollOptionArray[0])
    const onChange = (e) => {
        setScrollOption(e.target.value)
        props.setScrollOption(e.target.value)
    }

    return (
        <div>
            {scrollOptionArray.map(name => {
                return (
                    <div key={name}>
                <input type="radio" value={name}
                checked={scrollOption === name}
                onChange={onChange} />{name} </div>)
            })}     
        </div>
    )
}
