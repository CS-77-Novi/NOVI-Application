import CallList from "@/components/CallList";

const previous =() =>{
    return (
        <section className="flex size full flex colgap 10 animate- fade-in">
           <h1 className="text-3xl text black tex - center mt-3">upcoming meetings</h1>

            <CallList type="ended"/>
      
        </section>
    );
      
      
};
export default previous;

   

