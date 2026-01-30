import CallList from "@/components/CallList";

const recordings =() =>{
    return (
        <section className="flex size full flex colgap 10 animate- fade-in">
           <h1 className="text-3xl text black tex - center mt-3">recordings</h1>

            <CallList type="recordings"/>
      
        </section>
    );
      
      
};
export default recordings;

   