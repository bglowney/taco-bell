QUnit.module("Test ComponentQueue", function () {

    QUnit.test("Test Cycle", function (assert) {

        function assertEmptyQueue() {
            assert.equal(queue.queue.size, 0, "ComponentQueue should be empty");
        }

        var titleText1 = "Title 1";
        // initially we have not yet invoked a cycle
        assert.notOk($("#header").length, "Header element should not yet be in the DOM");
        assert.notOk($("#header-title").length, "Header title element should not yet be in the DOM");
        assert.equal(queue.queue.size, 6, "All newly constructed components should be in the queue");
        // assert.notOk($headerTitle.text(), "No title should be displayed initially");
        queue.cycle();
        var $headerTitle = $("#header-title");
        assertEmptyQueue();
        assert.equal($headerTitle.text(), titleText1, "Title text should be updated");


        // change model element
        var titleText2 = "Title 2";
        model.title.set(titleText2);
        assert.equal(queue.queue.size, 1, "One element should be in the ComponentQueue");
        // invoke a cycle
        queue.cycle();
        var $headerTitle = $("#header-title");
        assertEmptyQueue();
        assert.equal($headerTitle.text(), titleText2, "Title text should be updated");

        // add and remove collection elements
        var $items = $("#items");
        assert.equal($items.find("li").length, 0, "List initially contains zero elements");
        assertEmptyQueue();
        model.items.add("item 1");
        model.items.add("item 2");
        assert.equal(queue.queue.size, 3, "ComponentQueue should have a collection and 2 member elements added");
        assert.equal($items.find("li").length, 0, "Items have not yet been added to list");
        queue.cycle();
        assert.equal($items.find("li").length, 2, "List now contains 2 elements");
        assertEmptyQueue();
        model.items.remove(model.items.get()[1]);
        assert.equal(queue.queue.size, 1, "ComponentQueue should have 1 member element to be removed");
        queue.cycle();
        assert.equal($items.find("li").length, 1, "List now contains 1 element");

        function verifyEvent() {
            // verify events trigger a cycle
            var $button = $("#button");
            assertEmptyQueue();
            $button.click();
            assertEmptyQueue();
            assert.ok($("#header").length, "Header should existing in the dom");
            assert.notOk($("#header:visible").length, "Header should not be visible");
        }
        verifyEvent();

        // verify event handler is replaced after the button has been modified
        model.buttonText.set("Hide again");
        queue.cycle();
        verifyEvent();

        //verify input
        var inputValue = "value 1";
        var $input = $("#input");
        assertEmptyQueue();
        $input.val(inputValue);
        // there's an issue with $.fn.change();
        // need to trigger this with browser api
        $input[0].dispatchEvent(new Event("change"));
        assert.equal(model.inputValue.get(), inputValue);
        assertEmptyQueue();
        model.inputValue.set("value 2");
        queue.cycle();
        assertEmptyQueue();

        // check that the order of nodes is preserved
        assert.equal($("#header")[0].nextSibling, $("#items")[0], "Header is followed by items");
        assert.equal($("#items")[0].nextSibling, $("#button")[0], "Items is followed by button");
        assert.equal($("#button")[0].nextSibling, $("#input")[0], "Button is followed by input");

    });

});