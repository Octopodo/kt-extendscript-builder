
      class Greeting {
        private message: string;
        
        constructor(name: string) {
          this.message = `Hello, ${name}!`;
        }
        
        show(): void {
          alert(this.message);
        }
      }
      
      const greeting = new Greeting("Adobe");
      greeting.show();
      
      export { Greeting };
      